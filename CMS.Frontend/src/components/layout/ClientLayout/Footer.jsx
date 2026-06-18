import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} container`}>
        <div className={styles.grid}>
          <div className={styles.column}>
            <h3>ĐỊA CHỈ</h3>
            <p><strong>Trụ sở chính:</strong> Công ty Cổ Phần Phúc Long Heritage - ĐKKD: 0316 871719.</p>
            <p><strong>Nhà máy:</strong> D_BD_CN Đường XE 1, Khu Công Nghiệp Mỹ Phước III, Bình Dương.</p>
            <p><strong>Địa chỉ:</strong> Phòng 702, Tầng 7, Tòa nhà Central Plaza, số 17 Lê Duẩn, Quận 1, Hồ Chí Minh.</p>
            <p><strong>Hotline:</strong> 1900 6779</p>
            <p><strong>Email:</strong> sales@phuclong.masangroup.com</p>
          </div>

          <div className={styles.column}>
            <h3>CÔNG TY</h3>
            <ul className={styles.links}>
              <li><Link to="/about">Giới thiệu công ty</Link></li>
              <li><Link to="/about">Thư viện hình ảnh</Link></li>
              <li><Link to="/about">Liên hệ</Link></li>
              <li><Link to="/menu">Hình ảnh Menu</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3>TUYỂN DỤNG</h3>
            <ul className={styles.links}>
              <li><a href="#jobs">HTCH</a></li>
              <li><a href="#jobs">Kiosk</a></li>
              <li><a href="#jobs">Văn phòng</a></li>
              <li><a href="#jobs">Nhà máy</a></li>
            </ul>
            <h3 className={styles.subHead}>KHUYẾN MÃI</h3>
            <ul className={styles.links}>
              <li><Link to="/promotions">Tin khuyến mãi</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3>HỘI VIÊN</h3>
            <ul className={styles.links}>
              <li><Link to="/profile">Câu hỏi thường gặp (FAQ)</Link></li>
              <li><a href="#terms">Điều khoản và điều kiện chương trình hội viên</a></li>
              <li><a href="#terms">Điều khoản & Điều kiện Thẻ trả trước</a></li>
            </ul>
            <h3 className={styles.subHead}>CỬA HÀNG</h3>
            <ul className={styles.links}>
              <li><Link to="/stores">Danh sách cửa hàng</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3>LIÊN HỆ</h3>
            <ul className={styles.links}>
              <li><a href="#contact">Liên hệ</a></li>
            </ul>
            <h3 className={styles.subHead}>ĐIỀU KHOẢN SỬ DỤNG</h3>
            <ul className={styles.links}>
              <li><a href="#privacy">Chính sách bảo mật thông tin</a></li>
              <li><a href="#order-policy">Chính sách đặt hàng</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">© Công ty CP Phúc Long Heritage {new Date().getFullYear()}</div>
      </div>
    </footer>
  );
};

export default Footer;
