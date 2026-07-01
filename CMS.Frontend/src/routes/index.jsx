import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ClientLayout from '../components/layout/ClientLayout/ClientLayout';
import Home from '../pages/Home/Home';
import Menu from '../pages/Menu/Menu';
import ProductDetail from '../pages/ProductDetail/ProductDetail';
import Promotions from '../pages/Promotions/Promotions';
import AboutPage from '../pages/About/AboutPage';
import AboutDetailPage from '../pages/About/AboutDetailPage';

import Checkout from '../pages/Checkout/Checkout';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import ResetPassword from '../pages/ForgotPassword/ResetPassword';
import Profile from '../pages/Profile/Profile';
import StoresPage from '../pages/Stores/StoresPage';
import NotFound from '../pages/NotFound/NotFound';

const RequireAuth = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ClientLayout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="menu/:categorySlug" element={<Menu />} />
        <Route path="search" element={<Menu />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="about/:postSlug" element={<AboutDetailPage />} />
        <Route path="cart" element={<Navigate to="/checkout" replace />} />
        <Route path="checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="profile" element={<Profile />} />
        <Route path="customer/account" element={<Profile />} />
        <Route path="stores" element={<StoresPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
