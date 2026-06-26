import { useState, useCallback } from 'react';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Hook quản lý routing qua OSRM (miễn phí, không cần API key)
 * Trả về tọa độ route để vẽ Polyline trên Leaflet
 */
export default function useRouting() {
  const [routeCoords, setRouteCoords] = useState(null); // [[lat, lng], ...]
  const [routeInfo, setRouteInfo] = useState(null);     // { distance: km, duration: min }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRoute = useCallback(async (fromLat, fromLng, toLat, toLng) => {
    setLoading(true);
    setError(null);
    setRouteCoords(null);
    setRouteInfo(null);

    try {
      const url = `${OSRM_BASE}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('OSRM không phản hồi');
      const data = await res.json();

      if (data.code !== 'Ok' || !data.routes?.length) {
        throw new Error('Không tìm được đường đi');
      }

      const route = data.routes[0];
      // GeoJSON coordinates: [lng, lat] → chuyển thành [lat, lng] cho Leaflet
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      setRouteCoords(coords);
      setRouteInfo({
        distance: (route.distance / 1000).toFixed(1),   // km
        duration: Math.ceil(route.duration / 60),        // phút
      });
    } catch (err) {
      setError(err.message || 'Lỗi tải route');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRoute = useCallback(() => {
    setRouteCoords(null);
    setRouteInfo(null);
    setError(null);
  }, []);

  return { routeCoords, routeInfo, loading, error, getRoute, clearRoute };
}
