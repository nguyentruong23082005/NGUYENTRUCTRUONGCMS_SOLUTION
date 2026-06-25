import React from 'react';
import styles from './AddressDropdowns.module.css';

/**
 * Cascading dropdown Tỉnh/Thành phố → Quận/Huyện → Phường/Xã
 *
 * Component này là PRESENTATIONAL — không fetch dữ liệu, chỉ render.
 * Dùng kết hợp với useProvinces() hook ở component cha.
 *
 * Props:
 *   provinces, districts, wards — danh sách options
 *   province, district, ward    — giá trị đang chọn { code, name } | null
 *   onProvinceChange, onDistrictChange, onWardChange — callbacks
 *   inputClassName              — class CSS cho mỗi <select> (để tái sử dụng style của form cha)
 *   required                    — HTML required attribute
 *   loadingDistricts, loadingWards — trạng thái loading
 */
const AddressDropdowns = ({
  provinces = [],
  districts = [],
  wards = [],
  province = null,
  district = null,
  ward = null,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  inputClassName = '',
  required = false,
  loadingDistricts = false,
  loadingWards = false,
}) => {
  const handleProvince = (e) => {
    const code = Number(e.target.value) || e.target.value;
    const found = e.target.value ? provinces.find(p => String(p.code) === String(e.target.value)) : null;
    onProvinceChange(found ?? null);
  };

  const handleDistrict = (e) => {
    const found = e.target.value ? districts.find(d => String(d.code) === String(e.target.value)) : null;
    onDistrictChange(found ?? null);
  };

  const handleWard = (e) => {
    const found = e.target.value ? wards.find(w => String(w.code) === String(e.target.value)) : null;
    onWardChange(found ?? null);
  };

  return (
    <div className={styles.wrapper}>
      {/* Tỉnh/Thành phố */}
      <select
        className={`${styles.select} ${inputClassName}`}
        value={province?.code ?? ''}
        onChange={handleProvince}
        required={required}
        aria-label="Chọn Tỉnh/Thành phố"
      >
        <option value="">Chọn Tỉnh/Thành phố</option>
        {provinces.map(p => (
          <option key={p.code} value={p.code}>{p.name}</option>
        ))}
      </select>

      {/* Quận/Huyện */}
      <select
        className={`${styles.select} ${inputClassName}`}
        value={district?.code ?? ''}
        onChange={handleDistrict}
        disabled={!province || loadingDistricts}
        required={required}
        aria-label="Chọn Quận/Huyện"
      >
        <option value="">
          {loadingDistricts ? 'Đang tải...' : 'Chọn Quận/Huyện'}
        </option>
        {districts.map(d => (
          <option key={d.code} value={d.code}>{d.name}</option>
        ))}
      </select>

      {/* Phường/Xã */}
      <select
        className={`${styles.select} ${inputClassName}`}
        value={ward?.code ?? ''}
        onChange={handleWard}
        disabled={!district || loadingWards}
        required={required}
        aria-label="Chọn Phường/Xã"
      >
        <option value="">
          {loadingWards ? 'Đang tải...' : 'Chọn Phường/Xã'}
        </option>
        {wards.map(w => (
          <option key={w.code} value={w.code}>{w.name}</option>
        ))}
      </select>
    </div>
  );
};

export default AddressDropdowns;
