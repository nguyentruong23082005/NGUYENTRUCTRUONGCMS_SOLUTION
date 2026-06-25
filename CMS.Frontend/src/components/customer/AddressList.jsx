import React, { useCallback, useEffect, useState } from 'react';
import useCustomers from '../../hooks/useCustomers';
import useProvinces from '../../hooks/useProvinces';
import styles from '../../pages/Profile/Profile.module.css';

const ADDRESS_EMPTY = {
  receiverName: '',
  receiverPhone: '',
  addressLine: '',
  addressType: 'Home',
  isDefault: false,
};

/**
 * Tab Số địa chỉ — danh sách + form thêm/sửa địa chỉ
 */
const AddressList = () => {
  const {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    loading,
  } = useCustomers();

  const {
    provinces, districts, wards,
    province, district, ward,
    setProvince, setDistrict, setWard,
    initFromNames,
    loadingDistricts, loadingWards,
  } = useProvinces();

  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(ADDRESS_EMPTY);
  const [msg, setMsg] = useState(null);

  const reload = useCallback(() => {
    getAddresses().then(setAddresses).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const openAddForm = () => {
    setEditId(null);
    setForm(ADDRESS_EMPTY);
    setProvince(null); // reset cascading dropdown
    setShowForm(true);
    setMsg(null);
  };

  const openEditForm = (addr) => {
    setEditId(addr.id);
    setForm({
      receiverName: addr.receiverName,
      receiverPhone: addr.receiverPhone,
      addressLine: addr.addressLine,
      addressType: addr.addressType,
      isDefault: addr.isDefault,
    });
    // Khởi tạo dropdown từ tên đã lưu trong DB
    initFromNames(addr.province, addr.district, addr.ward);
    setShowForm(true);
    setMsg(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!province || !district || !ward) {
      setMsg({ type: 'error', text: 'Vui lòng chọn đầy đủ Tỉnh/Quận/Phường.' });
      return;
    }
    // Gộp tên tỉnh/quận/phường từ hook vào form payload
    const payload = {
      ...form,
      province: province.name,
      district: district.name,
      ward: ward.name,
    };
    try {
      if (editId) {
        await updateAddress(editId, payload);
        setMsg({ type: 'success', text: 'Cập nhật địa chỉ thành công!' });
      } else {
        await createAddress(payload);
        setMsg({ type: 'success', text: 'Thêm địa chỉ thành công!' });
      }
      setShowForm(false);
      reload();
    } catch {
      setMsg({ type: 'error', text: 'Không thể lưu địa chỉ. Vui lòng thử lại.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try {
      await deleteAddress(id);
      reload();
    } catch {
      setMsg({ type: 'error', text: 'Không thể xóa địa chỉ.' });
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      reload();
    } catch {
      setMsg({ type: 'error', text: 'Không thể thiết lập địa chỉ mặc định.' });
    }
  };

  return (
    <>
      <h2 className={styles.contentTitle}>Số địa chỉ</h2>

      {msg && (
        <div
          className={msg.type === 'success' ? styles.successMsg : styles.errorMsg}
          style={{ marginBottom: 16 }}
        >
          {msg.text}
        </div>
      )}

      {/* ── Form thêm / sửa ── */}
      {showForm && (
        <div className={styles.addressFormCard}>
          <p className={styles.addressFormTitle}>
            {editId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </p>
          <form onSubmit={handleSubmit}>
            <div className={styles.addressFormGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="al-receiverName">
                  Tên người nhận *
                </label>
                <input
                  id="al-receiverName"
                  name="receiverName"
                  className={styles.formInput}
                  value={form.receiverName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="al-receiverPhone">
                  Số điện thoại *
                </label>
                <input
                  id="al-receiverPhone"
                  name="receiverPhone"
                  className={styles.formInput}
                  value={form.receiverPhone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="al-province">
                  Tỉnh/Thành phố *
                </label>
                <select
                  id="al-province"
                  className={styles.formInput}
                  value={province?.code ?? ''}
                  onChange={(e) => {
                    const found = e.target.value
                      ? provinces.find(p => String(p.code) === e.target.value)
                      : null;
                    setProvince(found ?? null);
                  }}
                  required
                >
                  <option value="">Chọn Tỉnh/Thành phố</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="al-district">
                  Quận/Huyện *
                </label>
                <select
                  id="al-district"
                  className={styles.formInput}
                  value={district?.code ?? ''}
                  onChange={(e) => {
                    const found = e.target.value
                      ? districts.find(d => String(d.code) === e.target.value)
                      : null;
                    setDistrict(found ?? null);
                  }}
                  disabled={!province || loadingDistricts}
                  required
                >
                  <option value="">
                    {loadingDistricts ? 'Đang tải...' : 'Chọn Quận/Huyện'}
                  </option>
                  {districts.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="al-ward">
                  Phường/Xã *
                </label>
                <select
                  id="al-ward"
                  className={styles.formInput}
                  value={ward?.code ?? ''}
                  onChange={(e) => {
                    const found = e.target.value
                      ? wards.find(w => String(w.code) === e.target.value)
                      : null;
                    setWard(found ?? null);
                  }}
                  disabled={!district || loadingWards}
                  required
                >
                  <option value="">
                    {loadingWards ? 'Đang tải...' : 'Chọn Phường/Xã'}
                  </option>
                  {wards.map(w => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="al-addressType">
                  Loại địa chỉ *
                </label>
                <select
                  id="al-addressType"
                  name="addressType"
                  className={styles.formInput}
                  value={form.addressType}
                  onChange={handleChange}
                >
                  <option value="Home">Nhà riêng</option>
                  <option value="Office">Văn phòng</option>
                  <option value="Other">Khác</option>
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.addressFormFull}`}>
                <label className={styles.formLabel} htmlFor="al-addressLine">
                  Địa chỉ chi tiết *
                </label>
                <input
                  id="al-addressLine"
                  name="addressLine"
                  className={styles.formInput}
                  value={form.addressLine}
                  onChange={handleChange}
                  required
                  placeholder="Số nhà, tên đường..."
                />
              </div>

              <div className={`${styles.formGroup} ${styles.addressFormFull}`}>
                <label className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={form.isDefault}
                    onChange={handleChange}
                  />
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
            </div>

            <div className={styles.formActions} style={{ marginTop: 16 }}>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => {
                  setShowForm(false);
                  setMsg(null);
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Danh sách địa chỉ ── */}
      <div className={styles.addressList}>
        {addresses.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <p>Bạn chưa có địa chỉ nào.</p>
          </div>
        )}

        {addresses.map((addr) => {
          const typeLabel =
            addr.addressType === 'Home'
              ? 'Nhà riêng'
              : addr.addressType === 'Office'
              ? 'Văn phòng'
              : addr.addressType;

          return (
            <div
              key={addr.id}
              className={`${styles.addressCard} ${addr.isDefault ? styles.addressCardDefault : ''}`}
            >
              <div className={styles.addressInfo}>
                <div className={styles.addressName}>
                  {addr.receiverName} — {addr.receiverPhone}
                </div>
                <div className={styles.addressDetail}>
                  {addr.addressLine}, {addr.ward}, {addr.district}, {addr.province}
                </div>
                <div className={styles.addressTags}>
                  <span className={styles.addressTag}>{typeLabel}</span>
                  {addr.isDefault && (
                    <span className={`${styles.addressTag} ${styles.addressTagDefault}`}>
                      Mặc định
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.addressActions}>
                <button
                  type="button"
                  className={styles.btnIconAction}
                  onClick={() => openEditForm(addr)}
                >
                  Chỉnh sửa
                </button>
                {!addr.isDefault && (
                  <button
                    type="button"
                    className={styles.btnIconAction}
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    Đặt mặc định
                  </button>
                )}
                <button
                  type="button"
                  className={`${styles.btnIconAction} ${styles.btnIconDanger}`}
                  onClick={() => handleDelete(addr.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!showForm && (
        <div className={styles.addBtn}>
          <button type="button" className={styles.btnPrimary} onClick={openAddForm}>
            + Thêm địa chỉ mới
          </button>
        </div>
      )}
    </>
  );
};

export default AddressList;
