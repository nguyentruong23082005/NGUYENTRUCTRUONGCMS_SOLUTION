import React from 'react';
import styles from '../../pages/Profile/Profile.module.css';
import localStyles from './MemberCardTab.module.css';

/**
 * Tab Khách hàng thành viên — hiển thị thẻ thành viên Phúc Long và thông tin tích điểm
 * @param {{ profile: object|null }} props
 */
const MemberCardTab = ({ profile }) => {
  const cardIdStr = `PL${String(profile?.id || 0).padStart(6, '0')}`;
  // Giả lập điểm tích lũy ổn định theo ID khách hàng
  const points = profile?.id ? ((profile.id * 7) % 45 + 5) : 0;
  // Giả lập ngày đăng ký theo ID khách hàng
  const joinYear = profile?.id ? (2024 + (profile.id % 3)) : 2026;
  const joinMonth = profile?.id ? (1 + (profile.id % 12)) : 6;
  const joinDateStr = `${String(profile?.id ? (1 + (profile.id % 28)) : 19).padStart(2, '0')}/${String(joinMonth).padStart(2, '0')}/${joinYear}`;

  const nextTierPoints = 100;
  const progressPercent = Math.min(100, (points / nextTierPoints) * 100);

  return (
    <>
      <h2 className={styles.contentTitle}>Thẻ thành viên của tôi</h2>

      {/* ── Thẻ thành viên Phúc Long (Membership Card) ── */}
      <div className={styles.membershipCard} style={{ marginBottom: 32 }}>
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

      {/* ── Tiến trình nâng hạng ── */}
      <div className={localStyles.progressCard}>
        <h3 className={localStyles.progressTitle}>Tiến trình nâng hạng thẻ tiếp theo</h3>
        <p className={localStyles.progressDesc}>
          Bạn cần tích lũy thêm <strong>{nextTierPoints - points} điểm</strong> để nâng lên hạng thẻ <strong>Gold Member</strong>.
        </p>
        <div className={localStyles.progressBar}>
          <div className={localStyles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
        <div className={localStyles.progressLabels}>
          <span>Green Member ({points} điểm)</span>
          <span>Gold Member ({nextTierPoints} điểm)</span>
        </div>
      </div>

      {/* ── Đặc quyền hạng thẻ ── */}
      <div>
        <h3 className={localStyles.benefitsTitle}>Đặc quyền hạng thẻ Green Member</h3>
        <ul className={localStyles.benefitsList}>
          <li>Tích lũy điểm khi mua hàng tại hệ thống Phúc Long Coffee & Tea toàn quốc.</li>
          <li>Ưu đãi giảm giá 1% trên tổng hóa đơn mua hàng.</li>
          <li>Quà tặng sinh nhật đặc biệt dành cho thành viên (Voucher ưu đãi).</li>
          <li>Tham gia các chương trình Ngày hội thành viên Phúc Long định kỳ.</li>
        </ul>
      </div>
    </>
  );
};

export default MemberCardTab;
