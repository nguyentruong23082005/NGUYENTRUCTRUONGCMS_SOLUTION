import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import FloatingActions from './FloatingActions';

const ClientLayout = () => {
  return (
    <>
      <Header />
      <main style={{ flex: 1, minHeight: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
      <FloatingActions />
      <Footer />
    </>
  );
};

export default ClientLayout;
