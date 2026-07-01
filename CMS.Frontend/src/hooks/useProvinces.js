import { useCallback, useEffect, useState } from 'react';
import { mapOldAdministrativeNames } from '../utils/addressMapper';

const API_BASE = 'https://provinces.open-api.vn/api';
const STATIC_BASE = '/data';

// Module-level cache — sống xuyên suốt session, không phải per-render
const districtCache = {};
const wardCache = {};

async function loadDistricts(provinceCode) {
  if (districtCache[provinceCode]) return districtCache[provinceCode];
  // Always load from local static file to ensure correct 2025 post-merger data
  const res = await fetch(`${STATIC_BASE}/districts.json`);
  const all = await res.json();
  const list = (all[provinceCode] || []).map(d => ({ code: d.code, name: d.name }));
  districtCache[provinceCode] = list;
  return list;
}

async function loadWards(districtCode) {
  if (wardCache[districtCode]) return wardCache[districtCode];
  // Always load from local static file to ensure correct 2025 post-merger data
  const res = await fetch(`${STATIC_BASE}/wards.json`);
  const all = await res.json();
  const list = (all[districtCode] || []).map(w => ({ code: w.code, name: w.name }));
  wardCache[districtCode] = list;
  return list;
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

// Hàm loại bỏ dấu tiếng Việt
const removeAccents = (str) => {
  if (!str) return '';
  return str.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
};

// Hàm chuẩn hóa tên địa phương để so khớp
const normalizeLocalName = (name) => {
  if (!name) return '';
  let str = name.toLowerCase();
  
  // Ánh xạ các tên tiếng Anh / viết tắt phổ biến
  str = str.replace(/\bho chi minh city\b/g, 'ho chi minh');
  str = str.replace(/\bhcm\b/g, 'ho chi minh');
  str = str.replace(/\bhanoi\b/g, 'ha noi');
  str = str.replace(/\bdanang\b/g, 'da nang');
  str = str.replace(/\bhaiphong\b/g, 'hai phong');
  str = str.replace(/\bcantho\b/g, 'can tho');
  
  // Loại bỏ các tiền tố hành chính
  str = str.replace(/^(tỉnh|thành phố|quận|huyện|phường|xã|thị xã|thị trấn|thành phồ|phuong|quan|huyen|tinh|xa)\s+/g, '');
  
  return removeAccents(str).trim();
};

// So khớp thông minh hai tên địa lý
const namesMatch = (dbName, inputName) => {
  const normDb = normalizeLocalName(dbName);
  const normInput = normalizeLocalName(inputName);
  if (!normDb || !normInput) return false;
  return normDb === normInput || normDb.includes(normInput) || normInput.includes(normDb);
};

  /**
   * initFromNames — khởi tạo dropdown cho chế độ Edit từ tên đã lưu trong DB
   * Gọi sau khi data địa chỉ cũ được load xong
   */
  const initFromNames = useCallback(async (provinceName, districtName, wardName) => {
    if (!provinceName) return;
    const allProvinces = await fetch(`${STATIC_BASE}/provinces.json`).then(r => r.json());
    
    // Áp dụng Fuzzy Matching tìm Tỉnh
    const prov = allProvinces.find(p => namesMatch(p.name, provinceName));
    if (!prov) return;
    setProvinceState(prov);

    const dList = await loadDistricts(prov.code);
    setDistricts(dList);

    if (!districtName) return;

    // Ánh xạ đơn vị hành chính cũ trước sáp nhập
    const mapped = mapOldAdministrativeNames(districtName, wardName);

    // Áp dụng Fuzzy Matching tìm Quận
    const dist = dList.find(d => namesMatch(d.name, mapped.districtName));
    if (!dist) return;
    setDistrictState(dist);

    const wList = await loadWards(dist.code);
    setWards(wList);

    if (!mapped.wardName) return;
    
    // Áp dụng Fuzzy Matching tìm Phường
    const w = wList.find(x => namesMatch(x.name, mapped.wardName));
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
