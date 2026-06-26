import productApi from '../api/productApi';
import categoryApi from '../api/categoryApi';
import productImageApi from '../api/productImageApi';

/**
 * Service xử lý logic nghiệp vụ sản phẩm — transform data từ API
 * Tách logic chuyển đổi dữ liệu ra khỏi component để dễ bảo trì và test
 */

const getFullImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5188';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

const normalizeProduct = (item) => ({
  id: item.id.toString(),
  name: item.name || '',
  price: item.price || item.unitPrice || 0,
  stockQuantity: item.stockQuantity ?? item.unitsInStock ?? 0,
  totalSold: item.totalSold || 0,
  imageUrl: (item.imageUrl || item.thumbnailUrl || item.image) ? getFullImageUrl(item.imageUrl || item.thumbnailUrl || item.image) : '',
  description: item.description || '',
  categorySlug: item.categorySlug || '',
  productCategoryName: item.productCategoryName || item.categoryName || '',
  productCategoryImageUrl: item.productCategoryImageUrl ? getFullImageUrl(item.productCategoryImageUrl) : '',
  optionGroups: item.optionGroups || item.OptionGroups || []
});

// Lấy danh sách sản phẩm đã chuẩn hoá
export const getProducts = async (params = {}) => {
  const response = await productApi.getAll(params);
  const data = response.data?.data;
  if (response.data?.success && data?.items) {
    return {
      items: data.items.map(normalizeProduct),
      page: Number(data.page || 1),
      pageSize: Number(data.pageSize || 12),
      totalItems: Number(data.totalItems || 0),
      totalPages: Number(data.totalPages || 1)
    };
  }
  return { items: [], page: 1, pageSize: 12, totalItems: 0, totalPages: 1 };
};

// Tim kiem san pham qua endpoint search rieng (TC40)
export const searchProducts = async (params = {}, config = {}) => {
  const searchParams = {
    ...params,
    q: params.q ?? params.keyword
  };
  delete searchParams.keyword;
  delete searchParams.searchMode;

  const response = await productApi.search(searchParams, config);
  const data = response.data?.data;
  if (response.data?.success && data?.items) {
    return {
      items: data.items.map(normalizeProduct),
      page: Number(data.page || 1),
      pageSize: Number(data.pageSize || 12),
      totalItems: Number(data.totalItems || 0),
      totalPages: Number(data.totalPages || 1)
    };
  }
  return { items: [], page: 1, pageSize: 12, totalItems: 0, totalPages: 1 };
};

// Lấy chi tiết sản phẩm theo ID
export const getProductById = async (id) => {
  const response = await productApi.getById(id);
  if (response.data?.success && response.data?.data) {
    return normalizeProduct(response.data.data);
  }
  return null;
};

// Lấy cây danh mục sản phẩm
export const getCategoryTree = async () => {
  const response = await categoryApi.getTree();
  if (response.data?.success && response.data?.data) {
    return response.data.data.map(item => ({
      id: item.id.toString(),
      name: item.name,
      slug: item.slug
    }));
  }
  return [];
};

// Lấy danh sách hình ảnh bổ sung của sản phẩm
export const getProductImages = async (productId) => {
  try {
    const response = await productImageApi.getByProductId(productId);
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
  } catch (error) {
    console.warn('Sản phẩm không có ảnh bổ sung hoặc API lỗi:', error);
  }
  return [];
};

// Lấy 3 sản phẩm mới nhất (TC36)
export const getNewestProducts = async (count = 5) => {
  const response = await productApi.getNewest(count);
  if (response.data?.success && response.data?.data?.items) {
    return response.data.data.items.map(normalizeProduct);
  }
  return [];
};

// Lấy 3 sản phẩm bán chạy nhất (TC37)
export const getBestSellers = async (count = 3) => {
  const response = await productApi.getBestSellers(count);
  if (response.data?.success && response.data?.data?.items) {
    return response.data.data.items.map(normalizeProduct);
  }
  return [];
};

export default { getProducts, searchProducts, getProductById, getCategoryTree, getProductImages, getNewestProducts, getBestSellers };
