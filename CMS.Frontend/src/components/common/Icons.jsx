import React from 'react';

// Import các ảnh PNG thực tế từ thư mục assets/images
import thongTinImg from '../../assets/images/thongtin.png';
import uuDaiImg from '../../assets/images/uudai.png';
import diaChiImg from '../../assets/images/diachi.png';
import donHangImg from '../../assets/images/donhang.png';
import yeuThichImg from '../../assets/images/yeuthich.png';
import sanPhamImg from '../../assets/images/sanpham.png';
import lienHeImg from '../../assets/images/lienhe.png';
import logoutImg from '../../assets/images/ic_logout-8a4c2868a16c530269cd20a96261f960.png';

// 1. Thẻ thành viên / Thông tin cá nhân
export const ProfileIcon = ({ className }) => (
  <img src={thongTinImg} alt="Thông tin cá nhân" className={className} style={{ objectFit: 'contain' }} />
);

// 2. Khách hàng thành viên
export const MemberIcon = ({ className }) => (
  <img src={thongTinImg} alt="Khách hàng thành viên" className={className} style={{ objectFit: 'contain' }} />
);

// 3. Ưu đãi của tôi
export const VoucherIcon = ({ className }) => (
  <img src={uuDaiImg} alt="Ưu đãi" className={className} style={{ objectFit: 'contain' }} />
);

// 4. Số địa chỉ
export const AddressIcon = ({ className }) => (
  <img src={diaChiImg} alt="Địa chỉ" className={className} style={{ objectFit: 'contain' }} />
);

// 5. Đơn hàng
export const OrdersIcon = ({ className }) => (
  <img src={donHangImg} alt="Đơn hàng" className={className} style={{ objectFit: 'contain' }} />
);

// 6. Sản phẩm yêu thích
export const FavoriteIcon = ({ className }) => (
  <img src={yeuThichImg} alt="Sản phẩm yêu thích" className={className} style={{ objectFit: 'contain' }} />
);

// 7. Sản phẩm đã đặt
export const OrderedProductsIcon = ({ className }) => (
  <img src={sanPhamImg} alt="Sản phẩm đã đặt" className={className} style={{ objectFit: 'contain' }} />
);

// 8. Trung tâm trợ giúp
export const HelpIcon = ({ className }) => (
  <img src={lienHeImg} alt="Trung tâm trợ giúp" className={className} style={{ objectFit: 'contain' }} />
);

// 9. Đăng xuất
export const LogoutIcon = ({ className }) => (
  <img src={logoutImg} alt="Đăng xuất" className={className} style={{ objectFit: 'contain' }} />
);

// --- Header icons dùng chung ---
export const HeaderAccountIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="22" height="22" fill="none" stroke="#006F3C" strokeWidth="1.5">
    <circle cx="12" cy="8" r="4" />
    <path d="M5.5 20a6.5 6.5 0 0113 0" />
  </svg>
);

export const HeaderMailIcon = ({ className }) => (
  <img src={lienHeImg} alt="Liên hệ" className={className} style={{ objectFit: 'contain' }} />
);

export const SearchIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="18" height="18" fill="none" stroke="#a7adb1" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const CartIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75">
    <circle cx="9" cy="20" r="1" />
    <circle cx="17" cy="20" r="1" />
    <path d="M3 4h2.2l2.3 10.5a2 2 0 002 1.5h7.8a2 2 0 001.9-1.4L21 8H7" />
  </svg>
);

export const HomeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-4.5v-6h-3v6H4a1 1 0 01-1-1V9.5z" />
  </svg>
);

export const RegisterIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="20" height="20" fill="none">
    <rect x="2" y="5" width="20" height="14" rx="2.5" fill="url(#gradRegCard)" />
    <circle cx="8" cy="12" r="2.5" fill="#FFFFFF" opacity="0.4" />
    <path d="M14 9h5M14 12h4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="gradRegCard" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#4A90E2" />
        <stop offset="100%" stopColor="#50E3C2" />
      </linearGradient>
    </defs>
  </svg>
);

export default {
  HeaderAccountIcon,
  HeaderMailIcon,
  SearchIcon,
  CartIcon,
  HomeIcon,
  ProfileIcon,
  MemberIcon,
  RegisterIcon,
  LogoutIcon,
  VoucherIcon,
  AddressIcon,
  OrdersIcon,
  FavoriteIcon,
  OrderedProductsIcon,
  HelpIcon,
};
