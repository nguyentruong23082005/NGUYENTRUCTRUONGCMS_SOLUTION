import React, { useEffect, useState } from 'react';
import useCustomers from '../../hooks/useCustomers';
import styles from '../../pages/Profile/Profile.module.css';
import localStyles from './ProfileInfo.module.css';

/**
 * Tab Thông tin cá nhân — form cập nhật họ tên, SĐT và mật khẩu.
 * @param {{ profile: object|null, onRefresh: Function }} props
 */
const ProfileInfo = ({ profile, onRefresh }) => {
  const { updateProfile, loading } = useCustomers();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
  });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        fullName: profile.fullName || '',
        phone: profile.phone || '',
      }));
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!form.fullName.trim()) {
      setMsg({ type: 'error', text: 'Họ và tên không được để trống.' });
      return;
    }
    try {
      await updateProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || null,
        currentPassword: form.currentPassword || null,
        newPassword: form.newPassword || null,
      });
      setMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }));
      onRefresh();
    } catch {
      setMsg({ type: 'error', text: 'Cập nhật thất bại. Vui lòng kiểm tra lại.' });
    }
  };

  return (
    <>
      <h2 className={styles.contentTitle}>Thông tin cá nhân</h2>

      {msg && (
        <div className={msg.type === 'success' ? styles.successMsg : styles.errorMsg}>
          {msg.text}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>
        <div className={localStyles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="pi-fullName">Họ và tên *</label>
            <input
              id="pi-fullName"
              name="fullName"
              className={styles.formInput}
              value={form.fullName}
              onChange={handleChange}
              maxLength={100}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="pi-phone">Số điện thoại</label>
            <input
              id="pi-phone"
              name="phone"
              className={styles.formInput}
              value={form.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className={`${styles.formGroup} ${localStyles.emailGroup}`}>
            <label className={styles.formLabel} htmlFor="pi-email">Email (không thể thay đổi)</label>
            <input
              id="pi-email"
              className={styles.formInput}
              value={profile?.email || ''}
              disabled
              style={{ backgroundColor: '#F5F5F5', color: '#666666', cursor: 'not-allowed' }}
            />
          </div>
        </div>

        <p className={styles.formSectionTitle} style={{ marginTop: 28, marginBottom: 12 }}>Đổi mật khẩu (để trống nếu không đổi)</p>

        <div className={localStyles.passwordGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="pi-currentPassword">Mật khẩu hiện tại</label>
            <input
              id="pi-currentPassword"
              name="currentPassword"
              type="password"
              className={styles.formInput}
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="pi-newPassword">Mật khẩu mới</label>
            <input
              id="pi-newPassword"
              name="newPassword"
              type="password"
              className={styles.formInput}
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>
        </div>

        <div className={localStyles.formActions}>
          <button type="submit" className={`${styles.btnPrimary} ${localStyles.btnSubmit}`} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </>
  );
};

export default ProfileInfo;
