import productApi from '../api/productApi';
import categoryApi from '../api/categoryApi';
import productImageApi from '../api/productImageApi';

/**
 * Service xử lý logic nghiệp vụ sản phẩm — transform data từ API
 * Tách logic chuyển đổi dữ liệu ra khỏi component để dễ bảo trì và test
 */

// Chuẩn hoá dữ liệu sản phẩm từ API Backend sang định dạng Frontend
const normalizeProduct = (item) => ({
  id: item.id.toString(),
  name: item.name || '',
  price: item.price || item.unitPrice || 0,
  stockQuantity: item.stockQuantity ?? item.unitsInStock ?? 0,
  imageUrl: item.imageUrl || item.thumbnailUrl || item.image || '',
  description: item.description || '',
  categorySlug: item.categorySlug || '',
  productCategoryName: item.productCategoryName || item.categoryName || '',
  isBestSeller: Boolean(
    item.isBestSeller
    || item.isFeatured
    || item.isHot
    || /^best seller$/i.test(item.productCategoryName || item.categoryName || '')
  )
});

// Lấy danh sách sản phẩm đã chuẩn hoá
export const getProducts = async (params = {}) => {
  const response = await productApi.getAll(params);
  if (response.data?.success && response.data?.data?.items) {
    return response.data.data.items.map(normalizeProduct);
  }
  return [];
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
  const response = await productImageApi.getByProductId(productId);
  if (response.data?.success && response.data?.data) {
    return response.data.data;
  }
  return [];
};

export default { getProducts, getProductById, getCategoryTree, getProductImages };
