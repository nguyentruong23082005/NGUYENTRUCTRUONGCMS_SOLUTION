import React from 'react';

// 1. Thẻ thành viên xanh (Thông tin cá nhân)
export const ProfileIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="20" height="20" fill="none">
    <rect x="2" y="5" width="20" height="14" rx="2.5" fill="url(#gradCard)" />
    <rect x="4" y="8" width="5" height="4" rx="0.5" fill="#FFD700" opacity="0.9" />
    <line x1="12" y1="9" x2="19" y2="9" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="12" x2="17" y2="12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="4" y1="15" x2="9" y2="15" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
    <defs>
      <linearGradient id="gradCard" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#006F3C" />
        <stop offset="100%" stopColor="#004626" />
      </linearGradient>
    </defs>
  </svg>
);

// 2. Thẻ thành viên VIP/Gold (Khách hàng thành viên)
export const MemberIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="20" height="20" fill="none">
    <rect x="2" y="5" width="20" height="14" rx="2.5" fill="url(#gradGoldCard)" />
    <circle cx="17" cy="12" r="2.5" fill="#FFFFFF" opacity="0.3" />
    <path d="M4 14h6M4 11h8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <polygon points="17,8 18,10.5 20.5,10.5 18.5,12 19,14.5 17,13 15,14.5 15.5,12 13.5,10.5 16,10.5" fill="#FFD700" />
    <defs>
      <linearGradient id="gradGoldCard" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#B8860B" />
        <stop offset="50%" stopColor="#DAA520" />
        <stop offset="100%" stopColor="#8B6508" />
      </linearGradient>
    </defs>
  </svg>
);

// 3. Vé ưu đãi nâu (Ưu đãi của tôi)
export const VoucherIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="20" height="20" fill="none">
    <rect x="2" y="6" width="20" height="12" rx="2" fill="url(#gradVoucher)" />
    <line x1="7" y1="6" x2="7" y2="18" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" />
    <circle cx="14" cy="12" r="2.5" stroke="#FFFFFF" strokeWidth="1.5" />
    <line x1="15.5" y1="10.5" x2="12.5" y2="13.5" stroke="#FFFFFF" strokeWidth="1.5" />
    <defs>
      <linearGradient id="gradVoucher" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#C49A6C" />
        <stop offset="100%" stopColor="#A3784C" />
      </linearGradient>
    </defs>
  </svg>
);

// 4. Bản đồ và Ghim vị trí (Số địa chỉ)
export const AddressIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="20" height="20" fill="none">
    <path d="M3 6l6-3 6 3 6-3v12l-6 3-6-3-6 3V6z" fill="url(#gradMap)" />
    <path d="M12 5c-2 0-3.5 1.5-3.5 3.5 0 2.2 3.5 6.5 3.5 6.5s3.5-4.3 3.5-6.5C15.5 6.5 14 5 12 5z" fill="#B71C1C" />
    <circle cx="12" cy="8.5" r="1" fill="#FFFFFF" />
    <defs>
      <linearGradient id="gradMap" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#A3D9C9" />
        <stop offset="100%" stopColor="#4CA685" />
      </linearGradient>
    </defs>
  </svg>
);

// 5. Xe đẩy hàng xanh (Đơn hàng)
export const OrdersIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="20" height="20" fill="none">
    <path d="M2 3h3.5l2.5 10h10l2-7H7.5" stroke="#006F3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="18" r="1.5" fill="#333333" />
    <circle cx="17" cy="18" r="1.5" fill="#333333" />
    <path d="M8 9h10M10 6h6" stroke="#006F3C" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 6. Trái tim xanh lá 3D (Sản phẩm yêu thích)
export const FavoriteIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="20" height="20" fill="none">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#gradHeart)" />
    <defs>
      <linearGradient id="gradHeart" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#00A859" />
        <stop offset="100%" stopColor="#006F3C" />
      </linearGradient>
    </defs>
  </svg>
);

// 7. Hộp quà/Túi hàng nâu (Sản phẩm đã đặt)
export const OrderedProductsIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="20" height="20" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#gradBoxTop)" />
    <path d="M2 7v10l10 5V12L2 7z" fill="url(#gradBoxLeft)" />
    <path d="M22 7v10l-10 5V12l10-5z" fill="url(#gradBoxRight)" />
    <defs>
      <linearGradient id="gradBoxTop" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#D2B48C" />
        <stop offset="100%" stopColor="#CD853F" />
      </linearGradient>
      <linearGradient id="gradBoxLeft" x1="2" y1="7" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#8B5A2B" />
        <stop offset="100%" stopColor="#5C3317" />
      </linearGradient>
      <linearGradient id="gradBoxRight" x1="12" y1="12" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#CD853F" />
        <stop offset="100%" stopColor="#8B5A2B" />
      </linearGradient>
    </defs>
  </svg>
);

// 8. Điện thoại hỗ trợ (Trung tâm trợ giúp)
export const HelpIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="20" height="20" fill="none">
    <circle cx="12" cy="12" r="10" fill="url(#gradHelp)" />
    <path d="M12 16v-4M12 8h.01" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
    <defs>
      <linearGradient id="gradHelp" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#00BFFF" />
        <stop offset="100%" stopColor="#007AFF" />
      </linearGradient>
    </defs>
  </svg>
);

// 9. Cánh cửa và Mũi tên đỏ (Đăng xuất)
export const LogoutIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="20" height="20" fill="none">
    <rect x="3" y="3" width="10" height="18" rx="1.5" fill="url(#gradDoor)" />
    <path d="M12 12h9m-3-3l3 3-3 3" stroke="#B71C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="gradDoor" x1="3" y1="3" x2="13" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#E0E0E0" />
        <stop offset="100%" stopColor="#9E9E9E" />
      </linearGradient>
    </defs>
  </svg>
);

// --- Header icons dùng chung ---
export const HeaderAccountIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="22" height="22" fill="none" stroke="#006F3C" strokeWidth="1.5">
    <circle cx="12" cy="8" r="4" />
    <path d="M5.5 20a6.5 6.5 0 0113 0" />
  </svg>
);

export const HeaderMailIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} width="22" height="22" fill="none" stroke="#006F3C" strokeWidth="1.5">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
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
