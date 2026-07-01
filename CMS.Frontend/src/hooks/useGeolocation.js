import { useState, useCallback } from 'react';

/**
 * Tính khoảng cách Haversine giữa 2 điểm (km)
 */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Hook quản lý vị trí người dùng (Geolocation API)
 */
export default function useGeolocation() {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [granted, setGranted] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setGranted(true);
        setLoading(false);
      },
      (err) => {
        const messages = { 1: 'Bạn đã từ chối chia sẻ vị trí.', 2: 'Không xác định được vị trí.', 3: 'Hết thời gian chờ.' };
        setError(messages[err.code] || 'Không thể lấy vị trí.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  const getDistance = useCallback(
    (store) => {
      if (!userLocation) return null;
      const lat = Number(store.latitude);
      const lng = Number(store.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return haversine(userLocation.latitude, userLocation.longitude, lat, lng);
    },
    [userLocation],
  );

  const sortByDistance = useCallback(
    (stores) => {
      if (!userLocation) return stores;
      return [...stores].sort((a, b) => {
        const da = getDistance(a);
        const db = getDistance(b);
        if (da === null && db === null) return 0;
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      });
    },
    [userLocation, getDistance],
  );

  return { userLocation, setUserLocation, loading, error, granted, setGranted, requestLocation, getDistance, sortByDistance };
}
