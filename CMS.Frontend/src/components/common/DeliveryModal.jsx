import React, { useState, useEffect, useMemo } from 'react';
import { useDelivery } from '../../context/DeliveryContext';
import useStores from '../../hooks/useStores';
import styles from './DeliveryModal.module.css';

// Hàm tính khoảng cách Haversine (km)
const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Hàm phân tích cấu trúc địa chỉ trả về từ Nominatim
const parseNominatimAddress = (item) => {
  const addr = item.address || {};
  const province = addr.city || addr.state || addr.province || '';
  const district = addr.suburb || addr.district || addr.city_district || addr.county || addr.town || '';
  const ward = addr.quarter || addr.suburb || addr.ward || addr.village || addr.subdistrict || '';
  
  // Lấy số nhà và tên đường
  const houseNumber = addr.house_number || '';
  const road = addr.road || '';
  const street = [houseNumber, road].filter(Boolean).join(' ');

  return {
    province: province.trim(),
    district: district.trim(),
    ward: ward.trim(),
    street: street.trim() || item.display_name.split(',')[0].trim()
  };
};

const DeliveryModal = () => {
  const {
    isModalOpen,
    closeModal,
    deliveryType,
    deliveryAddress,
    setDelivery,
    setPickup,
  } = useDelivery();

  const { stores } = useStores();

  // Tab nội bộ của modal: 'delivery' | 'pickup'
  const [activeTab, setActiveTab] = useState('delivery');

  // States cho định vị GPS
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [tempCoords, setTempCoords] = useState(null);
  const [tempStructured, setTempStructured] = useState(null);

  // States cho tìm kiếm địa chỉ tự gõ
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // State tìm kiếm cửa hàng cho tab Đến Lấy
  const [pickupQuery, setPickupQuery] = useState('');

  // Đồng bộ tab hoạt động với trạng thái toàn cục khi mở modal
  useEffect(() => {
    if (isModalOpen) {
      setActiveTab(deliveryType || 'delivery');
      // Reset states định vị tạm thời khi mở lại modal
      setGpsError(null);
      setResolvedAddress('');
      setTempCoords(null);
      setTempStructured(null);
      setSearchQuery('');
      setSuggestions([]);
      setSearchLoading(false);
      setSearchError(null);
      setPickupQuery('');
    }
  }, [isModalOpen, deliveryType]);

  // Hiệu ứng Debounce 1000ms cho việc tìm kiếm địa chỉ
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setSearchError(null);
      return;
    }

    const delayTimer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);

      try {
        // Chỉ tìm kiếm tại Việt Nam (countrycodes=vn), nạp chi tiết địa chỉ (addressdetails=1)
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=vn&limit=5&addressdetails=1&email=nguyentruong23082005@gmail.com`;
        
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error('Không thể kết nối dịch vụ gợi ý địa chỉ.');
        const data = await res.json();

        if (data && data.length > 0) {
          setSuggestions(data);
        } else {
          setSuggestions([]);
          setSearchError('Không tìm thấy địa chỉ phù hợp.');
        }
      } catch (err) {
        console.error('Lỗi tìm kiếm địa chỉ:', err);
        setSearchError('Không thể tải gợi ý địa chỉ. Vui lòng thử lại sau.');
      } finally {
        setSearchLoading(false);
      }
    }, 1000);

    return () => clearTimeout(delayTimer);
  }, [searchQuery]);

  // Xử lý chọn địa chỉ từ gợi ý
  const handleSelectSuggestion = (item) => {
    const coords = { latitude: Number(item.lat), longitude: Number(item.lon) };
    const structured = parseNominatimAddress(item);

    setResolvedAddress(item.display_name);
    setTempCoords(coords);
    setTempStructured(structured);

    // Xoá ô tìm kiếm và gợi ý để gọn giao diện
    setSearchQuery('');
    setSuggestions([]);
  };

  // Xử lý định vị GPS & Dịch ngược địa chỉ (Reverse Geocoding)
  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Trình duyệt của bạn không hỗ trợ chức năng định vị.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);
    setResolvedAddress('');
    setTempCoords(null);
    setTempStructured(null);
    setSearchQuery('');
    setSuggestions([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setTempCoords({ latitude, longitude });

        try {
          // Sử dụng tham số email trên query string cho browser JS để tuân thủ chính sách Nominatim mà không gây lỗi CORS
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&email=nguyentruong23082005@gmail.com`;
          
          const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
          if (!res.ok) throw new Error('Không thể kết nối đến dịch vụ bản đồ.');
          const data = await res.json();

          if (!data || !data.display_name) {
            throw new Error('Không tìm thấy thông tin địa chỉ cho tọa độ này.');
          }

          const structured = parseNominatimAddress(data);

          setResolvedAddress(data.display_name);
          setTempStructured(structured);
        } catch (err) {
          console.error('Lỗi Reverse Geocoding:', err);
          setGpsError(err.message || 'Không thể dịch ngược tọa độ thành địa chỉ.');
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        const messages = {
          1: 'Bạn chưa cho phép ứng dụng truy cập vị trí của thiết bị.',
          2: 'Không thể xác định được vị trí hiện tại. Vui lòng kiểm tra lại GPS hoặc kết nối mạng.',
          3: 'Thời gian yêu cầu định vị đã hết hạn. Vui lòng thử lại.'
        };
        setGpsError(messages[err.code] || 'Đã xảy ra lỗi không xác định khi lấy vị trí.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Xác nhận lưu địa chỉ từ GPS (tự động tìm cửa hàng gần nhất)
  const handleConfirmGPSAddress = () => {
    if (resolvedAddress && tempCoords && tempStructured) {
      let nearestStore = null;
      let minDistance = Infinity;
      
      if (stores && stores.length > 0) {
        stores.forEach(s => {
          if (s.latitude && s.longitude) {
            const dist = getHaversineDistance(
              tempCoords.latitude,
              tempCoords.longitude,
              Number(s.latitude),
              Number(s.longitude)
            );
            if (dist < minDistance) {
              minDistance = dist;
              nearestStore = s;
            }
          }
        });
      }
      
      setDelivery(resolvedAddress, tempCoords, tempStructured, nearestStore);
    }
  };

  // Lọc cửa hàng trong bán kính 2km hoặc lấy 3 cửa hàng gần nhất
  const nearbyStores = useMemo(() => {
    if (!tempCoords || !stores || stores.length === 0) return { type: 'empty', list: [] };

    const storesWithDistance = stores
      .map(s => {
        const lat = Number(s.latitude);
        const lng = Number(s.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        
        const dist = getHaversineDistance(tempCoords.latitude, tempCoords.longitude, lat, lng);
        return { ...s, distance: dist };
      })
      .filter(Boolean);

    // Tìm các cửa hàng trong vòng 2km
    const within2km = storesWithDistance
      .filter(s => s.distance <= 2.0)
      .sort((a, b) => a.distance - b.distance);

    if (within2km.length > 0) {
      return { type: 'within2km', list: within2km };
    }

    // Nếu không có cửa hàng nào dưới 2km, lấy ra 3 cửa hàng gần nhất trong hệ thống
    const nearest3 = storesWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);
      
    return { type: 'nearest', list: nearest3 };
  }, [tempCoords, stores]);

  // Lọc cửa hàng cho tab Đến Lấy
  const filteredPickupStores = useMemo(() => {
    if (!stores) return [];
    const q = pickupQuery.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter(s => 
      [s.name, s.address].some(v => String(v || '').toLowerCase().includes(q))
    );
  }, [pickupQuery, stores]);

  // Nếu modal không mở, không render gì cả
  if (!isModalOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div 
        className={styles.modalBox} 
        onClick={(e) => e.stopPropagation()} // Ngăn nổi bọt sự kiện làm đóng modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Nút đóng modal tròn màu xanh lá cây góc trên bên phải */}
        <button 
          type="button" 
          className={styles.closeBtn} 
          onClick={closeModal} 
          aria-label="Đóng cửa sổ"
        >
          ×
        </button>

        {/* Cấu trúc Tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'delivery' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('delivery')}
          >
            GIAO HÀNG
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'pickup' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('pickup')}
          >
            ĐẾN LẤY
          </button>
        </div>

        {/* Nội dung Tab */}
        <div className={styles.tabContent}>
          {activeTab === 'delivery' ? (
            <div className={styles.deliveryTab}>
              <h3 id="modal-title" className={styles.tabTitle}>Địa chỉ giao hàng</h3>
              
              {/* Ô tìm kiếm Nominatim */}
              <div className={styles.searchSection}>
                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="search"
                    placeholder="Vui lòng nhập địa chỉ giao hàng..."
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Nhập địa chỉ giao hàng"
                  />
                  {searchLoading && <div className={styles.searchSpinner} />}
                </div>

                {/* Danh sách gợi ý địa chỉ */}
                {suggestions.length > 0 && (
                  <div className={styles.suggestionsDropdown}>
                    {suggestions.map((item) => (
                      <button
                        key={item.place_id}
                        type="button"
                        className={styles.suggestionItem}
                        onClick={() => handleSelectSuggestion(item)}
                      >
                        <svg className={styles.suggestionPinSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span className={styles.suggestionText}>{item.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchError && <p className={styles.searchError}>{searchError}</p>}
              </div>

              {/* Nút định vị GPS */}
              <div className={styles.gpsContainer}>
                <button
                  type="button"
                  className={`${styles.gpsBtn} ${gpsLoading ? styles.gpsLoading : ''}`}
                  onClick={handleGPSLocation}
                  disabled={gpsLoading}
                >
                  {/* SVG MyLocationIcon thay cho Emoji quả táo hồng tiêu tâm */}
                  <svg className={`${styles.myLocationIcon} ${gpsLoading ? styles.gpsLoadingIcon : ''}`} focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
                  </svg>
                  {gpsLoading ? 'Đang xác định vị trí...' : 'Vị trí hiện tại của quý khách'}
                </button>

                {gpsError && <p className={styles.gpsError}>{gpsError}</p>}

                {/* Kết quả định vị thành công */}
                {resolvedAddress && (
                  <div className={styles.resolvedCard}>
                    <div className={styles.resolvedInfo}>
                      <svg className={styles.pinIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span className={styles.addressText}>{resolvedAddress}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.confirmBtn}
                      onClick={handleConfirmGPSAddress}
                    >
                      Giao đến địa chỉ này
                    </button>
                  </div>
                )}
              </div>

              {/* Danh sách cửa hàng gần bạn trong vòng 2km */}
              {tempCoords && nearbyStores.list.length > 0 && (
                <div className={styles.nearbySection}>
                  <h4 className={styles.nearbyTitle}>
                    {nearbyStores.type === 'within2km' 
                      ? 'Các cửa hàng gần bạn trong vòng 2km' 
                      : 'Không có cửa hàng nào trong vòng 2km. Dưới đây là các cửa hàng gần bạn nhất:'}
                  </h4>
                  <div className={styles.nearbyList}>
                    {nearbyStores.list.map((store) => (
                      <button
                        key={store.id}
                        type="button"
                        className={styles.storeCard}
                        onClick={() => setDelivery(resolvedAddress, tempCoords, tempStructured, store)}
                      >
                        {store.imageUrl ? (
                          <div 
                            className={styles.storeThumb} 
                            style={{ backgroundImage: `url(${store.imageUrl})` }}
                            aria-hidden="true"
                          />
                        ) : (
                          <div className={styles.storePlaceholder} aria-hidden="true">
                            <svg className={styles.coffeeIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                              <line x1="6" y1="1" x2="6" y2="4"></line>
                              <line x1="10" y1="1" x2="10" y2="4"></line>
                              <line x1="14" y1="1" x2="14" y2="4"></line>
                            </svg>
                          </div>
                        )}
                        <div className={styles.storeInfo}>
                          <span className={styles.storeDistance}>
                            <svg className={styles.cardPinIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {(store.distance).toFixed(2)} km
                          </span>
                          <strong className={styles.storeName}>{store.name}</strong>
                          <span className={styles.storeLine}><b>Địa chỉ:</b> {store.address}</span>
                          {store.phone && <span className={styles.storeLine}><b>SĐT:</b> {store.phone}</span>}
                          <span className={styles.storeLine}>
                            <b>Giờ hoạt động:</b> {store.openingTime} – {store.closingTime}
                          </span>
                          <span className={styles.storeStatus}>Mở cửa</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.pickupTab}>
              <h3 id="modal-title" className={styles.tabTitle}>Chọn cửa hàng đến lấy</h3>
              
              {/* Ô tìm kiếm nhanh cửa hàng */}
              <div className={styles.searchSection}>
                <div className={styles.searchWrapper}>
                  <svg className={styles.searchIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="search"
                    placeholder="Tìm kiếm cửa hàng gần bạn..."
                    className={styles.searchInput}
                    value={pickupQuery}
                    onChange={(e) => setPickupQuery(e.target.value)}
                    aria-label="Tìm cửa hàng đến lấy"
                  />
                </div>
              </div>

              {/* Danh sách cuộn tất cả cửa hàng */}
              <div className={styles.storeListContainer}>
                {filteredPickupStores.length > 0 ? (
                  <div className={styles.nearbyList}>
                    {filteredPickupStores.map((store) => (
                      <button
                        key={store.id}
                        type="button"
                        className={styles.storeCard}
                        onClick={() => setPickup(store)}
                      >
                        {store.imageUrl ? (
                          <div 
                            className={styles.storeThumb} 
                            style={{ backgroundImage: `url(${store.imageUrl})` }}
                            aria-hidden="true"
                          />
                        ) : (
                          <div className={styles.storePlaceholder} aria-hidden="true">
                            <svg className={styles.coffeeIconSvg} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                              <line x1="6" y1="1" x2="6" y2="4"></line>
                              <line x1="10" y1="1" x2="10" y2="4"></line>
                              <line x1="14" y1="1" x2="14" y2="4"></line>
                            </svg>
                          </div>
                        )}
                        <div className={styles.storeInfo}>
                          <strong className={styles.storeName}>{store.name}</strong>
                          <span className={styles.storeLine}><b>Địa chỉ:</b> {store.address}</span>
                          {store.phone && <span className={styles.storeLine}><b>SĐT:</b> {store.phone}</span>}
                          <span className={styles.storeLine}>
                            <b>Giờ hoạt động:</b> {store.openingTime} – {store.closingTime}
                          </span>
                          <span className={styles.storeStatus}>Mở cửa</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyStores}>Không tìm thấy cửa hàng nào phù hợp.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryModal;
