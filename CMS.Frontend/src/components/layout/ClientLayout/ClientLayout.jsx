import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FloatingActions from './FloatingActions';

const ClientLayout = () => {
  const { pathname } = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname);

  if (isAuthPage) {
    return (
      <main>
        <Outlet />
      </main>
    );
  }

  return (
    <>
      <Header />
      <main style={{ flex: 1, minHeight: 'calc(100vh - 180px)' }}>
        <Outlet />
      </main>
      <FloatingActions />
      <Footer />
    </>
  );
};

export default ClientLayout;
