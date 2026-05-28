import React, { useState, useCallback } from 'react';
import '@shopify/polaris/build/esm/styles.css';
import {
  AppProvider,
  Frame,
  Navigation,
  TopBar,
  Page,
  Layout,
  Card,
  IndexTable,
  Badge,
  Text,
  useIndexResourceState,
  Filters,
} from '@shopify/polaris';
import {
  HomeIcon,
  OrderIcon,
  ProductIcon,
  PersonIcon,
  SearchIcon,
} from '@shopify/polaris-icons';
import enTranslations from '@shopify/polaris/locales/en.json';

function App() {
  // 1. Dữ liệu sản phẩm Phúc Long
  const products = [
    {
      id: '101',
      product: 'Trà Đào Cam Sả',
      status: <Badge tone="success">Đang bán</Badge>,
      inventory: 'Sẵn sàng',
      type: 'Trà trái cây',
      vendor: 'Phúc Long',
    },
    {
      id: '102',
      product: 'Cà Phê Sữa Đá',
      status: <Badge tone="info">Chờ duyệt</Badge>,
      inventory: 'Sẵn sàng',
      type: 'Cà phê',
      vendor: 'Phúc Long',
    },
    {
      id: '103',
      product: 'Trà Vải Lài',
      status: <Badge tone="success">Đang bán</Badge>,
      inventory: 'Hết nguyên liệu',
      type: 'Trà trái cây',
      vendor: 'Phúc Long',
    },
    {
      id: '104',
      product: 'Oolong Dâu Cà Phê',
      status: <Badge>Ngừng bán</Badge>,
      inventory: '0',
      type: 'Thức uống sáng tạo',
      vendor: 'Phúc Long',
    },
  ];

  const resourceName = {
    singular: 'thức uống',
    plural: 'thức uống',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products);

  const [searchValue, setSearchValue] = useState('');
  const handleSearchChange = useCallback((value) => setSearchValue(value), []);

  const searchFieldMarkup = (
    <TopBar.SearchField
      onChange={handleSearchChange}
      value={searchValue}
      placeholder="Tìm kiếm sản phẩm..."
      focused={false}
    />
  );

  const userMenuMarkup = (
    <TopBar.UserMenu
      name="Phúc Long Admin"
      detail="Quản lý cửa hàng"
      initials="PL"
    />
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      userMenu={userMenuMarkup}
      searchField={searchFieldMarkup}
    />
  );

  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          { label: 'Trang chủ', icon: HomeIcon },
          { label: 'Đơn hàng', icon: OrderIcon, badge: '24' },
          { label: 'Thức uống', icon: ProductIcon, selected: true },
          { label: 'Khách hàng', icon: PersonIcon },
        ]}
      />
    </Navigation>
  );

  const rowMarkup = products.map(
    ({ id, product, status, inventory, type, vendor }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {product}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{status}</IndexTable.Cell>
        <IndexTable.Cell>{inventory}</IndexTable.Cell>
        <IndexTable.Cell>{type}</IndexTable.Cell>
        <IndexTable.Cell>{vendor}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <AppProvider i18n={enTranslations}>
      <Frame topBar={topBarMarkup} navigation={navigationMarkup}>
        <Page
          title="Danh sách Thức uống"
          primaryAction={{ content: 'Thêm món mới', variant: 'primary' }}
          secondaryActions={[{ content: 'Cập nhật giá' }]}
        >
          <Layout>
            <Layout.Section>
              <Card padding="0">
                <div style={{ padding: '16px' }}>
                  <Filters
                    queryValue={searchValue}
                    filters={[]}
                    onQueryChange={handleSearchChange}
                    onQueryClear={() => setSearchValue('')}
                  />
                </div>

                <IndexTable
                  resourceName={resourceName}
                  itemCount={products.length}
                  selectedItemsCount={
                    allResourcesSelected ? 'All' : selectedResources.length
                  }
                  onSelectionChange={handleSelectionChange}
                  headings={[
                    { title: 'Sản phẩm' },
                    { title: 'Trạng thái' },
                    { title: 'Tồn kho' },
                    { title: 'Loại' },
                    { title: 'Thương hiệu' },
                  ]}
                >
                  {rowMarkup}
                </IndexTable>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
      </Frame>
    </AppProvider>
  );
}

export default App;