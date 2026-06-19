import React, { useEffect, useState } from 'react';
import useCustomers from '../../hooks/useCustomers';
import styles from '../../pages/Profile/Profile.module.css';

/**
 * Tab Thông tin cá nhân — form cập nhật họ tên, SĐT, đổi mật khẩu
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

  const cardIdStr = `PL${String(profile?.id || 0).padStart(6, '0')}`;
  // Giả lập điểm tích lũy ổn định theo ID khách hàng
  const points = profile?.id ? ((profile.id * 7) % 45 + 5) : 0;
  // Giả lập ngày đăng ký theo ID khách hàng
  const joinYear = profile?.id ? (2024 + (profile.id % 3)) : 2026;
  const joinMonth = profile?.id ? (1 + (profile.id % 12)) : 6;
  const joinDateStr = `${String(profile?.id ? (1 + (profile.id % 28)) : 19).padStart(2, '0')}/${String(joinMonth).padStart(2, '0')}/${joinYear}`;

  return (
    <>
      <h2 className={styles.contentTitle}>Thông tin cá nhân</h2>

      {/* ── Thẻ thành viên Phúc Long (Membership Card) ── */}
      <div className={styles.membershipCard}>
        <div className={styles.membershipLeft}>
          <div className={styles.membershipHeader}>
            <span className={styles.membershipTitle}>Thẻ Thành Viên Phúc Long</span>
            <span className={styles.membershipClass}>Hạng Thẻ Green</span>
          </div>

          <div className={styles.membershipUser}>
            <span className={styles.membershipUserName}>{profile?.fullName || 'KHÁCH HÀNG'}</span>
            <span className={styles.membershipUserPhone}>{profile?.phone || 'Chưa cập nhật SĐT'}</span>
          </div>

          <div className={styles.membershipStats}>
            <div className={styles.membershipStatItem}>
              <span className={styles.membershipStatLabel}>Điểm tích lũy</span>
              <span className={styles.membershipStatValue}>{points} điểm</span>
            </div>
            <div className={styles.membershipStatItem}>
              <span className={styles.membershipStatLabel}>Ngày đăng ký</span>
              <span className={styles.membershipStatValue}>{joinDateStr}</span>
            </div>
          </div>
        </div>

        <div className={styles.membershipRight}>
          <svg className={styles.membershipBarcode} viewBox="0 0 100 40">
            <rect x="0" y="0" width="3" height="40" fill="#FFFFFF" />
            <rect x="5" y="0" width="1" height="40" fill="#FFFFFF" />
            <rect x="8" y="0" width="2" height="40" fill="#FFFFFF" />
            <rect x="12" y="0" width="4" height="40" fill="#FFFFFF" />
            <rect x="18" y="0" width="1" height="40" fill="#FFFFFF" />
            <rect x="21" y="0" width="3" height="40" fill="#FFFFFF" />
            <rect x="26" y="0" width="2" height="40" fill="#FFFFFF" />
            <rect x="30" y="0" width="1" height="40" fill="#FFFFFF" />
            <rect x="33" y="0" width="4" height="40" fill="#FFFFFF" />
            <rect x="39" y="0" width="2" height="40" fill="#FFFFFF" />
            <rect x="43" y="0" width="1" height="40" fill="#FFFFFF" />
            <rect x="46" y="0" width="3" height="40" fill="#FFFFFF" />
            <rect x="51" y="0" width="2" height="40" fill="#FFFFFF" />
            <rect x="55" y="0" width="4" height="40" fill="#FFFFFF" />
            <rect x="61" y="0" width="1" height="40" fill="#FFFFFF" />
            <rect x="64" y="0" width="3" height="40" fill="#FFFFFF" />
            <rect x="69" y="0" width="2" height="40" fill="#FFFFFF" />
            <rect x="73" y="0" width="1" height="40" fill="#FFFFFF" />
            <rect x="76" y="0" width="4" height="40" fill="#FFFFFF" />
            <rect x="82" y="0" width="2" height="40" fill="#FFFFFF" />
            <rect x="86" y="0" width="1" height="40" fill="#FFFFFF" />
            <rect x="89" y="0" width="3" height="40" fill="#FFFFFF" />
            <rect x="94" y="0" width="2" height="40" fill="#FFFFFF" />
            <rect x="98" y="0" width="2" height="40" fill="#FFFFFF" />
          </svg>
          <span className={styles.membershipCardNumber}>
            {cardIdStr}
          </span>
        </div>
      </div>

      {msg && (
        <div className={msg.type === 'success' ? styles.successMsg : styles.errorMsg}>
          {msg.text}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Email (không thể thay đổi)</label>
          <input className={styles.formInput} value={profile?.email || ''} disabled />
        </div>

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

        <p className={styles.formSectionTitle}>Đổi mật khẩu (để trống nếu không đổi)</p>

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
          <span className={styles.formHint}>Chỉ điền nếu muốn thay đổi mật khẩu.</span>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </>
  );
};

export default ProfileInfo;
