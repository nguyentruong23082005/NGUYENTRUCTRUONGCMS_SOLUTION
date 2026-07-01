import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './LeafletMap.module.css';

// Fix Leaflet icon đường dẫn bị vỡ khi dùng Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

// Định nghĩa các marker icons tùy biến theo brand Phúc Long
const storeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Icon màu cam nổi bật cho cửa hàng đang chọn
const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [28, 45],
  iconAnchor: [14, 45],
  popupAnchor: [1, -38],
  shadowSize: [45, 45],
});

// Icon đỏ cho vị trí khách hàng
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * Sub-component để fly map đến selectedStore mỗi khi thay đổi
 */
function MapFlyTo({ center, zoom = 15 }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
}

/**
 * Component bản đồ Leaflet tương tác
 *
 * Props:
 *  - stores: cửa hàng có lat/lng hợp lệ
 *  - selectedStore: cửa hàng đang chọn
 *  - onSelectStore: callback khi click marker
 *  - userLocation: { latitude, longitude } | null
 *  - routeCoords: [[lat, lng], ...] | null
 *  - routeInfo: { distance, duration } | null
 *  - onClearRoute: callback xoá route
 *  - getDirectionUrl: hàm trả URL Google Maps fallback
 */
const LeafletMap = ({
  stores = [],
  selectedStore,
  onSelectStore,
  userLocation,
  routeCoords,
  routeInfo,
  onClearRoute,
  getDirectionUrl,
}) => {
  const popupRefs = useRef({});

  // Tâm bản đồ mặc định: TP.HCM
  const defaultCenter = [10.7769, 106.7009];

  // Tâm fly-to khi selectedStore thay đổi
  const flyCenter =
    selectedStore && Number.isFinite(Number(selectedStore.latitude))
      ? [Number(selectedStore.latitude), Number(selectedStore.longitude)]
      : null;

  const mappableStores = stores.filter(
    (s) => Number.isFinite(Number(s.latitude)) && Number.isFinite(Number(s.longitude)),
  );

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ width: '100%', height: '100%', minHeight: '520px' }}
        scrollWheelZoom
        zoomControl
      >
        {/* Bộ chuyển đổi loại bản đồ (Google Roadmap, Satellite, Hybrid và CartoDB Positron) */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Bản đồ đường bộ (Google)">
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
              url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Bản đồ vệ tinh (Google)">
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
              url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Bản đồ lai (Google Hybrid)">
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
              url="https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Bản đồ tối giản (CartoDB Positron)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Fly to selected store */}
        {flyCenter && <MapFlyTo center={flyCenter} zoom={15} />}

        {/* Marker vị trí user */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>
              <span style={{ fontFamily: 'Arimo, sans-serif', fontSize: '13px', color: '#333' }}>
                📍 Vị trí của bạn
              </span>
            </Popup>
          </Marker>
        )}

        {/* Markers cửa hàng */}
        {mappableStores.map((store) => {
          const isActive = selectedStore?.id === store.id;
          return (
            <Marker
              key={store.id}
              position={[Number(store.latitude), Number(store.longitude)]}
              icon={isActive ? activeIcon : storeIcon}
              eventHandlers={{ click: () => onSelectStore(store) }}
              ref={(ref) => { if (ref) popupRefs.current[store.id] = ref; }}
            >
              <Popup>
                <div style={{ fontFamily: 'Arimo, sans-serif', minWidth: '180px' }}>
                  <strong style={{ color: '#006f3c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                    {store.name}
                  </strong>
                  <span style={{ fontSize: '12px', color: '#333', display: 'block', marginBottom: '2px' }}>
                    {store.address}
                  </span>
                  {store.phone && (
                    <span style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '2px' }}>
                      ☎ {store.phone}
                    </span>
                  )}
                  {store.openingTime && (
                    <span style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '8px' }}>
                      🕐 {store.openingTime} – {store.closingTime}
                    </span>
                  )}
                  {getDirectionUrl && (
                    <a
                      href={getDirectionUrl(store)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: '#006f3c',
                        color: '#fff',
                        borderRadius: '4px',
                        fontSize: '12px',
                        textDecoration: 'none',
                      }}
                    >
                      <svg
                        style={{ width: '14px', height: '14px' }}
                        focusable="false"
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="m21.41 10.59-7.99-8c-.78-.78-2.05-.78-2.83 0l-8.01 8c-.78.78-.78 2.05 0 2.83l8.01 8c.78.78 2.05.78 2.83 0l7.99-8c.79-.79.79-2.05 0-2.83zM13.5 14.5V12H10v3H8v-4c0-.55.45-1 1-1h4.5V7.5L17 11l-3.5 3.5z"></path>
                      </svg>
                      Chỉ đường
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route polyline */}
        {routeCoords && (
          <Polyline
            positions={routeCoords}
            color="#006f3c"
            weight={4}
            opacity={0.85}
            dashArray="0"
          />
        )}
      </MapContainer>

      {/* Route info panel */}
      {routeInfo && (
        <div className={styles.routePanel}>
          <span>🛣 <strong>{routeInfo.distance} km</strong></span>
          <span>⏱ <strong>~{routeInfo.duration} phút</strong></span>
          {onClearRoute && (
            <button className={styles.routeClose} onClick={onClearRoute} title="Xoá route">×</button>
          )}
        </div>
      )}
    </div>
  );
};

export default LeafletMap;
