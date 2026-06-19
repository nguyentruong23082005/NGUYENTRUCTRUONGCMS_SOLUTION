import React, { useEffect, useMemo, useState } from 'react';
import useStores from '../../hooks/useStores';
import styles from './StoreLocator.module.css';

const toTime = (hour, minute) => {
  if (!hour && !minute) return '';
  return `${String(hour || '00').padStart(2, '0')}:${String(minute || '00').padStart(2, '0')}`;
};

const normalizeStore = (store) => ({
  id: String(store.id || store.storeCode || store.name || store.storeName),
  name: store.name || store.storeName || 'Phuc Long Coffee & Tea',
  address: store.address || store.officeAddress || '',
  phone: store.phone || store.officeNumber || store.contactMobile || '',
  imageUrl: store.imageUrl || '',
  openingTime: store.openingTime || toTime(store.storeOpenHourFrom, store.storeOpenMinuteFrom),
  closingTime: store.closingTime || toTime(store.storeOpenHourTo, store.storeOpenMinuteTo),
  status: store.status || store.activeStatus || 'Đang cập nhật',
  latitude: store.latitude,
  longitude: store.longitude,
  googleMapUrl: store.googleMapUrl,
});

const normalizeStores = (payload) => {
  const items = Array.isArray(payload)
    ? payload
    : payload?.items || payload?.data || [];

  return Array.isArray(items) ? items.map(normalizeStore) : [];
};

const hasValidCoordinate = (store) => {
  const latitude = Number(store.latitude);
  const longitude = Number(store.longitude);

  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && Math.abs(latitude) <= 90
    && Math.abs(longitude) <= 180;
};

const getMapUrl = (store) => {
  if (hasValidCoordinate(store)) {
    const latitude = Number(store.latitude);
    const longitude = Number(store.longitude);
    const spread = 0.01;
    const bbox = [
      longitude - spread,
      latitude - spread,
      longitude + spread,
      latitude + spread,
    ].join('%2C');

    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  }

  const query = store.googleMapUrl || `${store.name} ${store.address}`;

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;
};

const getDirectionUrl = (store) => {
  if (store.googleMapUrl) return store.googleMapUrl;

  const query = hasValidCoordinate(store)
    ? `${store.latitude},${store.longitude}`
    : `${store.name} ${store.address}`;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const StoreThumb = ({ store }) => (
  <span
    className={styles.storeThumb}
    style={store.imageUrl ? { backgroundImage: `url(${store.imageUrl})` } : undefined}
    aria-hidden="true"
  />
);

const StoreLocator = ({ variant = 'map' }) => {
  const { stores: rawStores, loading, error: errorMessage } = useStores();
  const [selectedStore, setSelectedStore] = useState(null);
  const [query, setQuery] = useState('');
  const isListPage = variant === 'list';

  const stores = useMemo(() => normalizeStores(rawStores), [rawStores]);

  useEffect(() => {
    if (stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0]);
    }
  }, [stores, selectedStore]);

  const visibleStores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return stores;

    return stores.filter((store) => [
      store.name,
      store.address,
      store.phone,
    ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery)));
  }, [query, stores]);

  const renderStoreInfo = (store, withDirectionLink = true) => (
    <span className={styles.storeCopy}>
      <span className={styles.storeStatus}>{store.status}</span>
      <strong className={styles.storeName}>{store.name}</strong>
      <span className={styles.storeLine}><b>Địa chỉ:</b> {store.address}</span>
      {store.phone && <span className={styles.storeLine}><b>Số điện thoại:</b> {store.phone}</span>}
      {(store.openingTime || store.closingTime) && (
        <span className={styles.storeLine}><b>Giờ hoạt động:</b> {store.openingTime} - {store.closingTime}</span>
      )}
      {withDirectionLink ? (
        <a
          className={styles.directionLink}
          href={getDirectionUrl(store)}
          target="_blank"
          rel="noreferrer"
        >
          Chỉ đường
        </a>
      ) : (
        <span className={styles.directionLink}>Chỉ đường</span>
      )}
    </span>
  );

  return (
    <section className={`${styles.section} ${isListPage ? styles.listSection : ''}`}>
      <div className="container">
        {!isListPage && (
          <>
            <h2 className={styles.sectionTitle}>Danh sách cửa hàng</h2>
            <p className={styles.sectionSubtitle}>Danh sách cửa hàng Phúc Long</p>
          </>
        )}

        {loading ? (
          <div className={styles.emptyState}>Đang tải danh sách cửa hàng từ hệ thống...</div>
        ) : stores.length > 0 && selectedStore ? (
          isListPage ? (
            <div className={styles.listPage}>
              <input
                className={styles.searchInput}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm kiếm cửa hàng Phúc Long"
                aria-label="Tìm cửa hàng"
              />

              <div className={styles.currentLocation}>Vị trí hiện tại của quý khách</div>
              <button type="button" className={styles.regionToggle}>Tìm kiếm theo khu vực</button>
              <div className={styles.resultCount}>Có {visibleStores.length} kết quả tìm kiếm</div>

              <div className={styles.fullList}>
                {visibleStores.map((store) => (
                  <article key={store.id} className={styles.listStoreItem}>
                    <StoreThumb store={store} />
                    {renderStoreInfo(store)}
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.grid}>
              <div className={styles.mapPanel}>
                <iframe
                  title={`Bản đồ ${selectedStore.name}`}
                  src={getMapUrl(selectedStore)}
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                  className={styles.mapFrame}
                />
              </div>

              <div className={styles.sidePanel}>
                <input
                  className={styles.searchInput}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm kiếm cửa hàng Phúc Long"
                  aria-label="Tìm cửa hàng"
                />

                <div className={styles.filterTitle}>Tìm kiếm theo khu vực</div>
                <div className={styles.filters}>
                  <select className={styles.select} aria-label="Chọn tỉnh thành">
                    <option>Tỉnh thành</option>
                  </select>
                  <select className={styles.select} aria-label="Chọn quận huyện">
                    <option>Quận/Huyện</option>
                  </select>
                  <select className={styles.select} aria-label="Chọn phường xã">
                    <option>Phường xã</option>
                  </select>
                </div>

                <div className={styles.currentLocation}>Vị trí hiện tại của quý khách</div>
                <h3 className={styles.listTitle}>Danh sách cửa hàng</h3>

                <div className={styles.list}>
                  {visibleStores.map((store) => (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => setSelectedStore(store)}
                      className={`${styles.storeItemBtn} ${selectedStore.id === store.id ? styles.activeStore : ''}`}
                    >
                      <StoreThumb store={store} />
                      {renderStoreInfo(store, false)}
                    </button>
                  ))}
                </div>
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
