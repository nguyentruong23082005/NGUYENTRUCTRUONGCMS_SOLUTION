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
export function mapOldAdministrativeNames(districtName, wardName) {
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
