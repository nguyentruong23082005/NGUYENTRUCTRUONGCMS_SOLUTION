import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { DeliveryProvider } from './context/DeliveryContext';
import { CartProvider, useCart } from './context/CartContext';
import AppRoutes from './routes';
import MergeCartModal from './components/cart/MergeCartModal';
import Toast from './components/common/Toast';

function AppContent() {
  const { showMergeModal, toast } = useCart();
  
  return (
    <>
      <AppRoutes />
      {showMergeModal && <MergeCartModal />}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <DeliveryProvider>
              <CartProvider>
                <AppContent />
              </CartProvider>
            </DeliveryProvider>
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;