import { useCallback, useEffect, useState } from 'react';

const API_BASE = 'https://provinces.open-api.vn/api';
const STATIC_BASE = '/data';

// Module-level cache — sống xuyên suốt session, không phải per-render
const districtCache = {};
const wardCache = {};

async function loadDistricts(provinceCode) {
  if (districtCache[provinceCode]) return districtCache[provinceCode];
  try {
    const res = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const list = (data.districts || []).map(d => ({ code: d.code, name: d.name }));
    districtCache[provinceCode] = list;
    return list;
  } catch {
    // Fallback: dùng file tĩnh đã lưu sẵn
    const res = await fetch(`${STATIC_BASE}/districts.json`);
    const all = await res.json();
    const list = (all[provinceCode] || []).map(d => ({ code: d.code, name: d.name }));
    districtCache[provinceCode] = list;
    return list;
  }
}

async function loadWards(districtCode) {
  if (wardCache[districtCode]) return wardCache[districtCode];
  try {
    const res = await fetch(`${API_BASE}/d/${districtCode}?depth=2`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const list = (data.wards || []).map(w => ({ code: w.code, name: w.name }));
    wardCache[districtCode] = list;
    return list;
  } catch {
    const res = await fetch(`${STATIC_BASE}/wards.json`);
    const all = await res.json();
    const list = (all[districtCode] || []).map(w => ({ code: w.code, name: w.name }));
    wardCache[districtCode] = list;
    return list;
  }
}

// Bộ từ điển ánh xạ các đơn vị hành chính cũ trước sáp nhập
const LEGACY_DISTRICT_MAP = {
  'quận 2': 'Thành phố Thủ Đức',
  'quận 9': 'Thành phố Thủ Đức',
  'quận thủ đức': 'Thành phố Thủ Đức'
};

const LEGACY_WARD_MAP = {
  'phường bình an': 'Phường An Khánh',
  'phường bình khánh': 'Phường An Khánh',
  'phường an khánh': 'Phường Thủ Thiêm' // Phường An Khánh cũ sáp nhập vào Thủ Thiêm mới
};

/**
 * Ánh xạ các đơn vị hành chính cũ trước sáp nhập sang đơn vị mới sau sáp nhập
 */
function mapOldAdministrativeNames(districtName, wardName) {
  let mappedDistrict = districtName;
  let mappedWard = wardName;

  if (districtName) {
    const key = districtName.trim().toLowerCase();
    if (LEGACY_DISTRICT_MAP[key]) {
      mappedDistrict = LEGACY_DISTRICT_MAP[key];
    }
  }

  if (wardName) {
    const key = wardName.trim().toLowerCase();
    if (LEGACY_WARD_MAP[key]) {
      mappedWard = LEGACY_WARD_MAP[key];
    }
  }

  return { districtName: mappedDistrict, wardName: mappedWard };
}

/**
 * Hook quản lý cascading dropdown Tỉnh → Quận → Phường
 * Dùng API provinces.open-api.vn, fallback sang file tĩnh /data/
 */
export default function useProvinces() {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [province, setProvinceState] = useState(null); // { code, name }
  const [district, setDistrictState] = useState(null);
  const [ward, setWardState] = useState(null);

  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load danh sách tỉnh một lần khi mount
  useEffect(() => {
    fetch(`${STATIC_BASE}/provinces.json`)
      .then(r => r.json())
      .then(setProvinces)
      .catch(console.error);
  }, []);

  const setProvince = useCallback(async (selected) => {
    setProvinceState(selected);
    setDistrictState(null);
    setWardState(null);
    setDistricts([]);
    setWards([]);
    if (!selected) return;
    setLoadingDistricts(true);
    try {
      setDistricts(await loadDistricts(selected.code));
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  const setDistrict = useCallback(async (selected) => {
    setDistrictState(selected);
    setWardState(null);
    setWards([]);
    if (!selected) return;
    setLoadingWards(true);
    try {
      setWards(await loadWards(selected.code));
    } finally {
      setLoadingWards(false);
    }
  }, []);

  const setWard = useCallback((selected) => {
    setWardState(selected);
  }, []);

  /**
   * initFromNames — khởi tạo dropdown cho chế độ Edit từ tên đã lưu trong DB
   * Gọi sau khi data địa chỉ cũ được load xong
   */
  const initFromNames = useCallback(async (provinceName, districtName, wardName) => {
    if (!provinceName) return;
    const allProvinces = await fetch(`${STATIC_BASE}/provinces.json`).then(r => r.json());
    const prov = allProvinces.find(p => p.name.toLowerCase() === provinceName.toLowerCase());
    if (!prov) return;
    setProvinceState(prov);

    const dList = await loadDistricts(prov.code);
    setDistricts(dList);

    if (!districtName) return;

    // Ánh xạ đơn vị hành chính cũ trước sáp nhập
    const mapped = mapOldAdministrativeNames(districtName, wardName);

    const dist = dList.find(d => d.name.toLowerCase() === mapped.districtName.toLowerCase());
    if (!dist) return;
    setDistrictState(dist);

    const wList = await loadWards(dist.code);
    setWards(wList);

    if (!mapped.wardName) return;
    const w = wList.find(x => x.name.toLowerCase() === mapped.wardName.toLowerCase());
    setWardState(w || null);
  }, []);

  return {
    provinces,
    districts,
    wards,
    province,
    district,
    ward,
    setProvince,
    setDistrict,
    setWard,
    initFromNames,
    loadingDistricts,
    loadingWards,
  };
}
