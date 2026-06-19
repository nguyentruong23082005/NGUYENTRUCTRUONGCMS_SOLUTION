import React from 'react';
import {
  User,
  Mail,
  ShoppingCart,
  Home,
  Search,
  UserPlus,
  LogOut,
  Ticket,
  MapPin,
  ShoppingBag,
} from 'lucide-react';

// Icon cho tài khoản ở Header
export const HeaderAccountIcon = ({ className }) => (
  <User className={className} size={22} strokeWidth={1.5} />
);

// Icon hòm thư / liên hệ
export const HeaderMailIcon = ({ className }) => (
  <Mail className={className} size={22} strokeWidth={1.5} />
);

// Icon tìm kiếm
export const SearchIcon = ({ className }) => (
  <Search className={className} size={18} strokeWidth={1.75} />
);

// Icon giỏ hàng bay
export const CartIcon = ({ className }) => (
  <ShoppingCart className={className} size={22} strokeWidth={1.75} />
);

// Icon trang chủ (ở trang Login/Register)
export const HomeIcon = ({ className }) => (
  <Home className={className} size={18} strokeWidth={1.75} />
);

// Icon cho Menu Tài Khoản trong Header & Sidebar Profile
export const ProfileIcon = ({ className }) => (
  <User className={className} size={18} strokeWidth={1.75} />
);

export const RegisterIcon = ({ className }) => (
  <UserPlus className={className} size={18} strokeWidth={1.75} />
);

export const LogoutIcon = ({ className }) => (
  <LogOut className={className} size={18} strokeWidth={1.75} />
);

export const VoucherIcon = ({ className }) => (
  <Ticket className={className} size={18} strokeWidth={1.75} />
);

export const AddressIcon = ({ className }) => (
  <MapPin className={className} size={18} strokeWidth={1.75} />
);

export const OrdersIcon = ({ className }) => (
  <ShoppingBag className={className} size={18} strokeWidth={1.75} />
);

export default {
  HeaderAccountIcon,
  HeaderMailIcon,
  SearchIcon,
  CartIcon,
  HomeIcon,
  ProfileIcon,
  RegisterIcon,
  LogoutIcon,
  VoucherIcon,
  AddressIcon,
  OrdersIcon,
};
