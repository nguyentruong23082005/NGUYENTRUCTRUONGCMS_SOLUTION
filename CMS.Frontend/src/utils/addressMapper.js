// Bộ từ điển ánh xạ các đơn vị hành chính cũ trước sáp nhập theo từng Quận/Huyện
const DISTRICT_WARD_MAP = {
  'quận 3': {
    'phường 10': 'Phường 9',
    'phường 13': 'Phường 12'
  },
  'quận 4': {
    'phường 6': 'Phường 9',
    'phường 10': 'Phường 8',
    'phường 14': 'Phường 15'
  },
  'quận 5': {
    'phường 3': 'Phường 2',
    'phường 6': 'Phường 5',
    'phường 8': 'Phường 7',
    'phường 10': 'Phường 11'
  },
  'quận 6': {
    'phường 3': 'Phường 1',
    'phường 4': 'Phường 1',
    'phường 6': 'Phường 2',
    'phường 5': 'Phường 2'
  },
  'quận 8': {
    'phường 1': 'Phường Rạch Ông',
    'phường 2': 'Phường Rạch Ông',
    'phường 3': 'Phường Rạch Ông',
    'phường 8': 'Phường Hưng Phú',
    'phường 9': 'Phường Hưng Phú',
    'phường 10': 'Phường Hưng Phú',
    'phường 11': 'Phường Xóm Củi',
    'phường 12': 'Phường Xóm Củi',
    'phường 13': 'Phường Xóm Củi'
  },
  'quận 10': {
    'phường 7': 'Phường 6',
    'phường 5': 'Phường 8',
    'phường 11': 'Phường 10'
  },
  'quận 11': {
    'phường 2': 'Phường 1'
  },
  'quận gò vấp': {
    'phường 4': 'Phường 1',
    'phường 7': 'Phường 1',
    'phường 9': 'Phường 8',
    'phường 13': 'Phường 14'
  },
  'quận phú nhuận': {
    'phường 3': 'Phường 4',
    'phường 17': 'Phường 15'
  },
  'thành phố thủ đức': {
    'phường bình an': 'Phường An Khánh',
    'phường bình khánh': 'Phường An Khánh',
    'phường an khánh': 'Phường Thủ Thiêm'
  },
  'quận 2': {
    'phường bình an': 'Phường An Khánh',
    'phường bình khánh': 'Phường An Khánh',
    'phường an khánh': 'Phường Thủ Thiêm'
  }
};

const LEGACY_DISTRICT_MAP = {
  'quận 2': 'Thành phố Thủ Đức',
  'quận 9': 'Thành phố Thủ Đức',
  'quận thủ đức': 'Thành phố Thủ Đức'
};

/**
 * Ánh xạ các đơn vị hành chính cũ trước sáp nhập sang đơn vị mới sau sáp nhập
 */
export function mapOldAdministrativeNames(districtName, wardName) {
  let mappedDistrict = districtName ? districtName.trim() : '';
  let mappedWard = wardName ? wardName.trim() : '';

  if (mappedDistrict) {
    const key = mappedDistrict.toLowerCase();
    if (LEGACY_DISTRICT_MAP[key]) {
      mappedDistrict = LEGACY_DISTRICT_MAP[key];
    }
  }

  if (mappedWard && mappedDistrict) {
    const districtKey = districtName ? districtName.trim().toLowerCase() : '';
    const finalDistrictKey = mappedDistrict.toLowerCase();
    const wardKey = mappedWard.toLowerCase();

    const wardMapForOriginal = DISTRICT_WARD_MAP[districtKey];
    const wardMapForFinal = DISTRICT_WARD_MAP[finalDistrictKey];

    if (wardMapForOriginal && wardMapForOriginal[wardKey]) {
      mappedWard = wardMapForOriginal[wardKey];
    } else if (wardMapForFinal && wardMapForFinal[wardKey]) {
      mappedWard = wardMapForFinal[wardKey];
    }
  }

  return { 
    districtName: mappedDistrict || districtName, 
    wardName: mappedWard || wardName 
  };
}
