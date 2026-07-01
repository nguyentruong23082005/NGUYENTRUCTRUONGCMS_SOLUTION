import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DeliveryContext = createContext();

const LOCAL_STORAGE_KEY = 'phuclong_delivery_info';

export const DeliveryProvider = ({ children }) => {
  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' | 'pickup'
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null); // { latitude, longitude }
  const [structuredAddress, setStructuredAddress] = useState(null); // { province, district, ward, street }
  const [selectedStore, setSelectedStore] = useState(null); // store object (đến lấy hoặc cửa hàng giao)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load ban đầu từ localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.deliveryType) setDeliveryType(parsed.deliveryType);
        if (parsed.deliveryAddress) setDeliveryAddress(parsed.deliveryAddress);
        if (parsed.coordinates) setCoordinates(parsed.coordinates);
        if (parsed.structuredAddress) setStructuredAddress(parsed.structuredAddress);
        if (parsed.selectedStore) setSelectedStore(parsed.selectedStore);
      } catch (e) {
        console.error('Lỗi phân tích cú pháp delivery info từ localStorage:', e);
      }
    } else {
      // Nếu chưa có địa chỉ, tự động nổi bảng chọn
      setIsModalOpen(true);
    }
    setIsInitialized(true);
  }, []);

  // Lưu thông tin giao hàng
  const setDelivery = useCallback((address, coords, structured, store = null) => {
    setDeliveryType('delivery');
    setDeliveryAddress(address);
    setCoordinates(coords);
    setStructuredAddress(structured);
    setSelectedStore(store);

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      deliveryType: 'delivery',
      deliveryAddress: address,
      coordinates: coords,
      structuredAddress: structured,
      selectedStore: store
    }));
    setIsModalOpen(false);
  }, []);

  // Lưu thông tin tự đến lấy
  const setPickup = useCallback((store) => {
    const address = store.address || '';
    const coords = store.latitude && store.longitude 
      ? { latitude: Number(store.latitude), longitude: Number(store.longitude) } 
      : null;

    setDeliveryType('pickup');
    setDeliveryAddress(address);
    setCoordinates(coords);
    setStructuredAddress({
      province: store.province || '',
      district: store.district || '',
      ward: store.ward || '',
      street: address
    });
    setSelectedStore(store);

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      deliveryType: 'pickup',
      deliveryAddress: address,
      coordinates: coords,
      structuredAddress: {
        province: store.province || '',
        district: store.district || '',
        ward: store.ward || '',
        street: address
      },
      selectedStore: store
    }));
    setIsModalOpen(false);
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <DeliveryContext.Provider
      value={{
        deliveryType,
        deliveryAddress,
        coordinates,
        structuredAddress,
        selectedStore,
        isModalOpen,
        isInitialized,
        setDelivery,
        setPickup,
        openModal,
        closeModal
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery phải được sử dụng bên trong một DeliveryProvider');
  }
  return context;
};

export default DeliveryContext;
