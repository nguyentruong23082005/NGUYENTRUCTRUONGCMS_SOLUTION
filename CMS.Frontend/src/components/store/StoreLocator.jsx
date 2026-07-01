import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import useStores from '../../hooks/useStores';
import useProvinces from '../../hooks/useProvinces';
import useGeolocation from '../../hooks/useGeolocation';
import useRouting from '../../hooks/useRouting';
import styles from './StoreLocator.module.css';

// Lazy-load LeafletMap để tránh SSR issue
const LeafletMap = React.lazy(() => import('./LeafletMap'));

/* ─── helpers ─── */
const toTime = (h, m) => (h || m ? `${String(h || 0).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}` : '');

const hasValidCoord = (s) => {
  const lat = Number(s.latitude);
  const lng = Number(s.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
};

const normalizeStore = (s) => ({
  id: String(s.id ?? s.storeCode ?? s.name ?? ''),
  name: s.name || s.storeName || 'Phuc Long Coffee & Tea',
  address: s.address || s.officeAddress || '',
  phone: s.phone || s.officeNumber || s.contactMobile || '',
  imageUrl: s.imageUrl || '',
  openingTime: s.openingTime || toTime(s.storeOpenHourFrom, s.storeOpenMinuteFrom),
  closingTime: s.closingTime || toTime(s.storeOpenHourTo, s.storeOpenMinuteTo),
  status: s.status || s.activeStatus || 'Đang cập nhật',
  latitude: s.latitude,
  longitude: s.longitude,
  googleMapUrl: s.googleMapUrl,
  // Thêm province/district/ward để bộ lọc hoạt động
  province: s.province || '',
  district: s.district || '',
  ward: s.ward || '',
});

const normalizeStores = (payload) => {
  const items = Array.isArray(payload) ? payload : payload?.items || payload?.data || [];
  return Array.isArray(items) ? items.map(normalizeStore) : [];
};

const getDirectionUrl = (store, userLoc) => {
  if (store.googleMapUrl) return store.googleMapUrl;
  const dest = hasValidCoord(store) ? `${store.latitude},${store.longitude}` : `${store.name} ${store.address}`;
  if (userLoc) {
    return `https://www.google.com/maps/dir/${userLoc.latitude},${userLoc.longitude}/${encodeURIComponent(dest)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`;
};

const fmtDist = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

/* ─── StoreThumb ─── */
const StoreThumb = ({ store }) => (
  <span
    className={styles.storeThumb}
    style={store.imageUrl ? { backgroundImage: `url(${store.imageUrl})` } : undefined}
    aria-hidden="true"
  />
);

/* ─── Main component ─── */
const StoreLocator = ({ variant = 'map' }) => {
  const { stores: rawStores, loading, error: errorMessage } = useStores();
  const [selectedStore, setSelectedStore] = useState(null);
  const [query, setQuery] = useState('');
  const [activeRoute, setActiveRoute] = useState(null); // storeId đang hiện route
  const isListPage = variant === 'list';

  // Trạng thái dịch ngược địa chỉ chữ cho định vị GPS trên trang
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);

  /* Cascading filter: Tỉnh → Quận → Phường */
  const {
    provinces, districts, wards,
    province: filterProvince, district: filterDistrict, ward: filterWard,
    setProvince: setFilterProvince, setDistrict: setFilterDistrict, setWard: setFilterWard,
    loadingDistricts, loadingWards,
  } = useProvinces();

  /* Geolocation */
  const {
    userLocation, setUserLocation, loading: geoLoading, error: geoError, granted: geoGranted, setGranted: setGeoGranted,
    requestLocation, getDistance, sortByDistance,
  } = useGeolocation();

  /* Tìm kiếm địa điểm ngoài hệ thống (Nominatim Autocomplete) */
  const [addressSearch, setAddressSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    if (addressSearch.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      setSearchLoading(true);
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressSearch)}&format=json&limit=5&countrycodes=vn`, {
        headers: {
          'User-Agent': 'CMS.Frontend/1.0 (nguyentruong23082005@gmail.com)'
        }
      })
        .then(r => r.json())
        .then(data => {
          setSuggestions(data || []);
          setSearchLoading(false);
        })
        .catch(err => {
          console.error(err);
          setSearchLoading(false);
        });
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [addressSearch]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectSuggestion = (sug) => {
    const lat = parseFloat(sug.lat);
    const lon = parseFloat(sug.lon);
    setUserLocation({ latitude: lat, longitude: lon });
    setGeoGranted(true);
    setResolvedAddress(sug.display_name);
    setAddressSearch('');
    setSuggestions([]);
    setSuggestionsOpen(false);
    handleClearRoute();
  };

  // Tự động dịch ngược tọa độ GPS thành địa chỉ chữ khi định vị thành công
  useEffect(() => {
    if (geoGranted && userLocation && !resolvedAddress && !addressLoading) {
      const fetchAddress = async () => {
        setAddressLoading(true);
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.latitude}&lon=${userLocation.longitude}&addressdetails=1&email=nguyentruong23082005@gmail.com`;
          const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setResolvedAddress(data.display_name);
            }
          }
        } catch (err) {
          console.error('Lỗi lấy địa chỉ từ tọa độ trên StoreLocator:', err);
        } finally {
          setAddressLoading(false);
        }
      };
      fetchAddress();
    }
  }, [geoGranted, userLocation, resolvedAddress, addressLoading]);

  /* Routing OSRM */
  const { routeCoords, routeInfo, loading: routeLoading, getRoute, clearRoute } = useRouting();

  const stores = useMemo(() => normalizeStores(rawStores), [rawStores]);

  useEffect(() => {
    if (stores.length > 0 && !selectedStore) setSelectedStore(stores[0]);
  }, [stores, selectedStore]);

  /* Filter theo khu vực + text search */
  const visibleStores = useMemo(() => {
    let result = stores;
    if (filterProvince) {
      result = result.filter((s) => s.province && s.province.toLowerCase().includes(filterProvince.name.toLowerCase()));
    }
    if (filterDistrict) {
      result = result.filter((s) => s.district && s.district.toLowerCase().includes(filterDistrict.name.toLowerCase()));
    }
    if (filterWard) {
      result = result.filter((s) => s.ward && s.ward.toLowerCase().includes(filterWard.name.toLowerCase()));
    }
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((s) => [s.name, s.address, s.phone].some((v) => String(v || '').toLowerCase().includes(q)));
    }
    return result;
  }, [stores, filterProvince, filterDistrict, filterWard, query]);

  /* Sắp xếp theo khoảng cách nếu đã có vị trí */
  const sortedStores = useMemo(
    () => (geoGranted ? sortByDistance(visibleStores) : visibleStores),
    [geoGranted, sortByDistance, visibleStores],
  );

  /* Chỉ đường thật: nếu có geolocation → vẽ route; nếu không → mở Google Maps */
  const handleDirection = useCallback(
    async (store) => {
      if (geoGranted && userLocation && hasValidCoord(store)) {
        setActiveRoute(store.id);
        setSelectedStore(store);
        await getRoute(userLocation.latitude, userLocation.longitude, Number(store.latitude), Number(store.longitude));
      } else {
        window.open(getDirectionUrl(store, userLocation), '_blank', 'noreferrer');
      }
    },
    [geoGranted, userLocation, getRoute],
  );

  const handleClearRoute = useCallback(() => {
    clearRoute();
    setActiveRoute(null);
  }, [clearRoute]);

  /* ─── render store info ─── */
  const renderStoreInfo = (store, withDirection = true) => {
    const dist = getDistance(store);
    return (
      <span className={styles.storeCopy}>
        <span className={styles.storeStatus}>{store.status}</span>
        <strong className={styles.storeName}>{store.name}</strong>
        <span className={styles.storeLine}><b>Địa chỉ:</b> {store.address}</span>
        {store.phone && <span className={styles.storeLine}><b>Số điện thoại:</b> {store.phone}</span>}
        {(store.openingTime || store.closingTime) && (
          <span className={styles.storeLine}><b>Giờ hoạt động:</b> {store.openingTime} – {store.closingTime}</span>
        )}
        {dist !== null && (
          <span className={styles.distanceBadge}>
            <svg className={styles.badgePinIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {fmtDist(dist)}
          </span>
        )}
        {withDirection && (
          <button
            type="button"
            className={`${styles.directionBtn} ${activeRoute === store.id && routeLoading ? styles.loading : ''}`}
            onClick={(e) => { e.stopPropagation(); handleDirection(store); }}
            disabled={routeLoading && activeRoute === store.id}
          >
            {routeLoading && activeRoute === store.id ? (
              'Đang tải...'
            ) : (
              <>
                <svg className={styles.directionIconSvg} focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m21.41 10.59-7.99-8c-.78-.78-2.05-.78-2.83 0l-8.01 8c-.78.78-.78 2.05 0 2.83l8.01 8c.78.78 2.05.78 2.83 0l7.99-8c.79-.79.79-2.05 0-2.83zM13.5 14.5V12H10v3H8v-4c0-.55.45-1 1-1h4.5V7.5L17 11l-3.5 3.5z"></path>
                </svg>
                Chỉ đường
              </>
            )}
          </button>
        )}
      </span>
    );
  };

  /* ─── JSX ─── */
  return (
    <section className={`${styles.section} ${isListPage ? styles.listSection : ''}`}>
      <div className="container">
        {!isListPage && (
          <>
            <h2 className={styles.sectionTitle}>Danh sách cửa hàng</h2>
            <p className={styles.sectionSubtitle}>Tìm cửa hàng Phúc Long gần bạn nhất</p>
          </>
        )}

        {loading ? (
          <div className={styles.emptyState}>Đang tải danh sách cửa hàng...</div>
        ) : stores.length > 0 ? (
          isListPage ? (
            /* ── List page variant ── */
            <div className={styles.listPage}>
              <div className={styles.searchRow}>
                <input
                  className={styles.searchInput}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm cửa hàng Phúc Long"
                  aria-label="Tìm cửa hàng"
                />
              </div>
              <button
                type="button"
                className={`${styles.geoBtn} ${geoLoading || addressLoading ? styles.geoLoading : ''}`}
                onClick={requestLocation}
                disabled={geoLoading || addressLoading}
              >
                <svg className={`${styles.myLocationIcon} ${geoLoading || addressLoading ? styles.gpsLoadingIcon : ''}`} focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
                </svg>
                {geoLoading || addressLoading ? 'Đang xác định vị trí...' : 'Vị trí hiện tại của quý khách'}
              </button>
              {geoError && <p className={styles.geoError}>{geoError}</p>}

              {/* Hiển thị địa chỉ chữ đã dịch ngược */}
              {resolvedAddress && (
                <div className={styles.resolvedAddressCard}>
                  <svg className={styles.pinIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className={styles.resolvedAddressText}>{resolvedAddress}</span>
                </div>
              )}
              <div className={styles.resultCount}>Có {sortedStores.length} kết quả tìm kiếm</div>
              <div className={styles.fullList}>
                {sortedStores.map((store) => (
                  <article key={store.id} className={styles.listStoreItem}>
                    <StoreThumb store={store} />
                    {renderStoreInfo(store)}
                  </article>
                ))}
              </div>
            </div>
          ) : (
            /* ── Map page variant ── */
            <div className={styles.grid}>
              {/* Bản đồ Leaflet */}
              <div className={styles.mapPanel}>
                <React.Suspense fallback={<div className={styles.mapLoading}>Đang tải bản đồ...</div>}>
                  <LeafletMap
                    stores={stores}
                    selectedStore={selectedStore}
                    onSelectStore={setSelectedStore}
                    userLocation={userLocation}
                    routeCoords={routeCoords}
                    routeInfo={routeInfo}
                    onClearRoute={handleClearRoute}
                    getDirectionUrl={(s) => getDirectionUrl(s, userLocation)}
                  />
                </React.Suspense>
              </div>

              {/* Sidebar */}
              <div className={styles.sidePanel}>
                <input
                  className={styles.searchInput}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm cửa hàng Phúc Long"
                  aria-label="Tìm cửa hàng"
                />

                {/* Tìm kiếm địa điểm của bạn (Autocomplete) */}
                <div ref={searchContainerRef} className={styles.addressSearchWrapper}>
                  <input
                    className={styles.searchInput}
                    type="text"
                    value={addressSearch}
                    onChange={(e) => {
                      setAddressSearch(e.target.value);
                      setSuggestionsOpen(true);
                    }}
                    onFocus={() => setSuggestionsOpen(true)}
                    placeholder="Nhập địa chỉ của bạn..."
                    aria-label="Tìm địa chỉ của bạn"
                  />
                  {searchLoading && <div className={styles.searchSpinner}>Đang tìm gợi ý...</div>}
                  {suggestionsOpen && suggestions.length > 0 && (
                    <ul className={styles.suggestionsList}>
                      {suggestions.map((sug, idx) => (
                        <li key={idx} onClick={() => handleSelectSuggestion(sug)} className={styles.suggestionItem}>
                          <span className={styles.suggestionText}>{sug.display_name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Geolocation button */}
                <button
                  type="button"
                  className={`${styles.geoBtn} ${geoLoading || addressLoading ? styles.geoLoading : ''}`}
                  onClick={requestLocation}
                  disabled={geoLoading || addressLoading}
                >
                  <svg className={`${styles.myLocationIcon} ${geoLoading || addressLoading ? styles.gpsLoadingIcon : ''}`} focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
                  </svg>
                  {geoLoading || addressLoading ? 'Đang xác định vị trí...' : 'Vị trí hiện tại của quý khách'}
                </button>
                {geoError && <p className={styles.geoError}>{geoError}</p>}

                {/* Hiển thị địa chỉ chữ đã dịch ngược */}
                {resolvedAddress && (
                  <div className={styles.resolvedAddressCard}>
                    <svg className={styles.pinIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span className={styles.resolvedAddressText}>{resolvedAddress}</span>
                  </div>
                )}

                {/* Filter theo khu vực */}
                <div className={styles.filterTitle}>Tìm kiếm theo khu vực</div>
                <div className={styles.filters}>
                  {/* Tỉnh thành */}
                  <select
                    className={styles.select}
                    aria-label="Chọn tỉnh thành"
                    value={filterProvince?.code ?? ''}
                    onChange={(e) => {
                      const found = e.target.value ? provinces.find((p) => String(p.code) === e.target.value) : null;
                      setFilterProvince(found ?? null);
                    }}
                  >
                    <option value="">Tỉnh thành</option>
                    {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                  </select>

                  {/* Quận huyện */}
                  <select
                    className={styles.select}
                    aria-label="Chọn quận huyện"
                    value={filterDistrict?.code ?? ''}
                    onChange={(e) => {
                      const found = e.target.value ? districts.find((d) => String(d.code) === e.target.value) : null;
                      setFilterDistrict(found ?? null);
                    }}
                    disabled={!filterProvince || loadingDistricts}
                  >
                    <option value="">{loadingDistricts ? 'Đang tải...' : 'Quận/Huyện'}</option>
                    {districts.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
                  </select>

                  {/* Phường xã — THÊM MỚI */}
                  <select
                    className={styles.select}
                    aria-label="Chọn phường xã"
                    value={filterWard?.code ?? ''}
                    onChange={(e) => {
                      const found = e.target.value ? wards.find((w) => String(w.code) === e.target.value) : null;
                      setFilterWard(found ?? null);
                    }}
                    disabled={!filterDistrict || loadingWards}
                  >
                    <option value="">{loadingWards ? 'Đang tải...' : 'Phường/Xã'}</option>
                    {wards.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
                  </select>
                </div>

                {routeInfo && routeInfo.steps && routeInfo.steps.length > 0 ? (
                  <div className={styles.directionsPanel}>
                    <div className={styles.directionsHeader}>
                      <button
                        type="button"
                        onClick={handleClearRoute}
                        className={styles.backBtn}
                      >
                        ← Quay lại danh sách
                      </button>
                      <h4 className={styles.directionsTitle}>Chỉ dẫn đường đi</h4>
                    </div>
                    <div className={styles.routeSummary}>
                      <span>Khoảng cách: <strong>{routeInfo.distance} km</strong></span>
                      <span>Thời gian đi: <strong>~{routeInfo.duration} phút</strong></span>
                    </div>
                    <div className={styles.stepsList}>
                      {routeInfo.steps.map((step, idx) => (
                        <div key={idx} className={styles.stepItem}>
                          <span className={styles.stepNum}>{idx + 1}</span>
                          <span className={styles.stepText}>{step.instruction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className={styles.listTitle}>
                      Danh sách cửa hàng <span className={styles.resultBadge}>{sortedStores.length}</span>
                    </h3>

                    <div className={styles.list}>
                      {sortedStores.map((store) => (
                        <div
                          key={store.id}
                          onClick={() => { setSelectedStore(store); handleClearRoute(); }}
                          className={`${styles.storeItemBtn} ${selectedStore?.id === store.id ? styles.activeStore : ''}`}
                          role="button"
                          tabIndex={0}
                        >
                          <StoreThumb store={store} />
                          {renderStoreInfo(store)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        ) : (
          <div className={styles.emptyState} role="status">
            <strong>Chưa có dữ liệu cửa hàng từ hệ thống.</strong>
            <span>{errorMessage || 'Backend API đang trả về danh sách rỗng.'}</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default StoreLocator;
