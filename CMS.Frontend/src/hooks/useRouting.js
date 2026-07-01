import { useState, useCallback } from 'react';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

function translateManeuver(step) {
  const m = step.maneuver;
  const name = step.name ? `vào đường ${step.name}` : 'tiếp';
  const distanceStr = step.distance > 0 ? ` đi khoảng ${Math.round(step.distance)}m` : '';

  switch (m.type) {
    case 'depart':
      return `Khởi hành${distanceStr}`;
    case 'arrive':
      return `Đến nơi (Điểm đến ở bên ${m.modifier === 'left' ? 'trái' : 'phải'})`;
    case 'turn': {
      let dir = '';
      if (m.modifier === 'left') dir = 'Rẽ trái';
      else if (m.modifier === 'right') dir = 'Rẽ phải';
      else if (m.modifier === 'slight left') dir = 'Chếch bên trái';
      else if (m.modifier === 'slight right') dir = 'Chếch bên phải';
      else if (m.modifier === 'sharp left') dir = 'Rẽ ngoặt bên trái';
      else if (m.modifier === 'sharp right') dir = 'Rẽ ngoặt bên phải';
      else dir = 'Rẽ';
      return `${dir} ${name}${distanceStr}`;
    }
    case 'continue':
      return `Tiếp tục đi thẳng ${name}${distanceStr}`;
    case 'new name':
      return `Đi thẳng ${name}${distanceStr}`;
    case 'roundabout':
      return `Đi vào vòng xuyến, lối ra thứ ${m.exit || 1}${distanceStr}`;
    case 'fork':
      return `Rẽ nhánh bên ${m.modifier === 'left' ? 'trái' : 'phải'} ${name}${distanceStr}`;
    default:
      return `Đi thẳng ${name}${distanceStr}`;
  }
}

/**
 * Hook quản lý routing qua OSRM (miễn phí, không cần API key)
 * Trả về tọa độ route để vẽ Polyline trên Leaflet
 */
export default function useRouting() {
  const [routeCoords, setRouteCoords] = useState(null); // [[lat, lng], ...]
  const [routeInfo, setRouteInfo] = useState(null);     // { distance: km, duration: min, steps: [...] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRoute = useCallback(async (fromLat, fromLng, toLat, toLng) => {
    setLoading(true);
    setError(null);
    setRouteCoords(null);
    setRouteInfo(null);

    try {
      const url = `${OSRM_BASE}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('OSRM không phản hồi');
      const data = await res.json();

      if (data.code !== 'Ok' || !data.routes?.length) {
        throw new Error('Không tìm được đường đi');
      }

      const route = data.routes[0];
      // GeoJSON coordinates: [lng, lat] → chuyển thành [lat, lng] cho Leaflet
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      
      // Parse chi tiết chỉ đường từng bước
      const steps = route.legs?.[0]?.steps?.map(step => ({
        instruction: translateManeuver(step),
        distance: step.distance,
        duration: step.duration
      })) || [];

      setRouteCoords(coords);
      setRouteInfo({
        distance: (route.distance / 1000).toFixed(1),   // km
        duration: Math.ceil(route.duration / 60),        // phút
        steps: steps
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
