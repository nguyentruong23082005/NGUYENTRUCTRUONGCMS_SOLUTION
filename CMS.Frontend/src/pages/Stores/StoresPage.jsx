import React from 'react';
import { Helmet } from 'react-helmet-async';
import StoreLocator from '../../components/store/StoreLocator';

const StoresPage = () => {
  return (
    <main>
      <Helmet>
        <title>Danh sách cửa hàng Phúc Long - Tìm vị trí cửa hàng</title>
      </Helmet>

      <StoreLocator variant="map" />
    </main>
  );
};

export default StoresPage;
