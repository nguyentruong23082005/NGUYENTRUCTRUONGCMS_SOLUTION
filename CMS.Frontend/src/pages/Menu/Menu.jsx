import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import categoryApi from '../../api/categoryApi';
import productApi from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCardSkeleton';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import styles from './Menu.module.css';

const normalizeRouteSlug = (slug = '') => decodeURIComponent(slug).replace(/--c\d+$/i, '');

const normalizeCategory = (item, level = 0) => {
  const children = item.children || item.Children || [];

  return {
    id: String(item.id),
    name: item.name,
    slug: item.slug || '',
    level,
    children: children.map((child) => normalizeCategory(child, level + 1))
  };
};

const flattenCategories = (items = []) => items.flatMap((item) => [
  item,
  ...flattenCategories(item.children || [])
]);

const getMenuPath = (category) => (
  category.slug ? `/menu/${category.slug}` : '/menu'
);

const toSentenceCase = (value = '') => {
  const normalized = value.trim().toLocaleLowerCase('vi-VN');
  if (!normalized) return '';
  return `${normalized.charAt(0).toLocaleUpperCase('vi-VN')}${normalized.slice(1)}`;
};

const formatSectionTitle = (name = '') => toSentenceCase(name);

const normalizeProduct = (item) => ({
  id: String(item.id),
  name: item.name,
  price: item.price || item.unitPrice || 0,
  stockQuantity: item.stockQuantity ?? item.unitsInStock ?? 0,
  imageUrl: item.imageUrl || '',
  categorySlug: item.categorySlug || '',
  productCategoryName: item.productCategoryName || item.categoryName || '',
  isBestSeller: Boolean(
    item.isBestSeller
    || item.isFeatured
    || item.isHot
    || /^best seller$/i.test(item.productCategoryName || item.categoryName || '')
  )
});

const Menu = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const activeSlug = normalizeRouteSlug(categorySlug || '');

  const [products, setProducts] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = useMemo(() => flattenCategories(categoryTree), [categoryTree]);
  const activeCategory = useMemo(
    () => categories.find((category) => category.slug === activeSlug) || null,
    [activeSlug, categories]
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getTree();
        const items = response?.data?.data || [];
        setCategoryTree(Array.isArray(items) ? items.map((item) => normalizeCategory(item)) : []);
      } catch (error) {
        console.error('Không tải được danh mục từ API:', error);
        setCategoryTree([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const params = {
          page: 1,
          pageSize: 50,
          ...(searchQuery ? { keyword: searchQuery } : {})
        };
        const firstResponse = await productApi.getAll(params);
        const firstPayload = firstResponse?.data?.data;
        const firstItems = firstPayload?.items || firstPayload || [];
        const totalPages = Number(firstPayload?.totalPages || 1);
        const remainingRequests = [];

        for (let page = 2; page <= totalPages; page += 1) {
          remainingRequests.push(productApi.getAll({ ...params, page }));
        }

        const remainingResponses = await Promise.all(remainingRequests);
        const remainingItems = remainingResponses.flatMap((response) => {
          const payload = response?.data?.data;
          return payload?.items || payload || [];
        });
        const items = [
          ...(Array.isArray(firstItems) ? firstItems : []),
          ...remainingItems
        ];

        setProducts(items.map(normalizeProduct));
      } catch (error) {
        console.error('Không tải được sản phẩm từ API:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  const productCategoryNames = useMemo(
    () => new Set(products.map((product) => product.productCategoryName).filter(Boolean)),
    [products]
  );

  const visibleCategoryTree = useMemo(() => categoryTree
    .filter((category) => {
      const hasOwnProducts = productCategoryNames.has(category.name);
      const hasChildProducts = (category.children || [])
        .some((child) => productCategoryNames.has(child.name));

      return hasOwnProducts || hasChildProducts;
    }), [categoryTree, productCategoryNames]);

  const groupedSections = useMemo(() => {
    if (searchQuery) {
      return [{
        id: 'search',
        name: `Kết quả tìm kiếm "${searchQuery}"`,
        products
      }];
    }

    if (activeCategory?.children?.length) {
      return activeCategory.children
        .map((child) => ({
          id: child.id,
          name: child.name,
          products: products.filter((product) => product.productCategoryName === child.name)
        }))
        .filter((section) => section.products.length > 0);
    }

    if (activeCategory) {
      return [{
        id: activeCategory.id,
        name: activeCategory.name,
        products: products.filter((product) => product.productCategoryName === activeCategory.name)
      }].filter((section) => section.products.length > 0);
    }

    return visibleCategoryTree.flatMap((category) => {
      if (category.children?.length) {
        return category.children.map((child) => ({
          id: child.id,
          name: child.name,
          products: products.filter((product) => product.productCategoryName === child.name)
        }));
      }

      return [{
        id: category.id,
        name: category.name,
        products: products.filter((product) => product.productCategoryName === category.name)
      }];
    }).filter((section) => section.products.length > 0);
  }, [activeCategory, products, searchQuery, visibleCategoryTree]);

  const getPageTitle = () => {
    if (searchQuery) return `Kết quả tìm kiếm cho "${searchQuery}"`;
    if (activeCategory) return activeCategory.name;
    return 'Sản phẩm';
  };

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{getPageTitle()} - Phúc Long Coffee & Tea</title>
      </Helmet>

      <div className={styles.menuContainer}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <nav className={styles.categoryNav} aria-label="Danh mục sản phẩm">
              <Link to="/menu" className={`${styles.topLink} ${!activeSlug ? styles.activeCategory : ''}`}>
                Tất cả
              </Link>

              {visibleCategoryTree.map((category) => {
                const isParentActive = activeSlug === category.slug
                  || category.children.some((child) => child.slug === activeSlug);

                return (
                  <div key={category.id} className={styles.categoryGroup}>
                    <Link
                      to={getMenuPath(category)}
                      className={`${styles.parentLink} ${isParentActive ? styles.parentActive : ''}`}
                    >
                      {category.name}
                    </Link>

                    {isParentActive && category.children.length > 0 && (
                      <ul className={styles.childList}>
                        {category.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              to={getMenuPath(child)}
                              className={`${styles.childLink} ${activeSlug === child.slug ? styles.activeCategory : ''}`}
                            >
                              {formatSectionTitle(child.name)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          <section className={styles.content}>
            {loading ? (
              <div className={styles.grid}>
                {Array.from({ length: 5 }).map((_, index) => <ProductCardSkeleton key={index} />)}
              </div>
            ) : groupedSections.length > 0 ? (
              groupedSections.map((section) => (
                <section key={section.id} className={styles.productSection}>
                  <h2 className={styles.sectionTitle}>{formatSectionTitle(section.name)}</h2>
                  <div className={styles.grid}>
                    {section.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={{
                          ...product
                        }}
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <EmptyState
                title="Không tìm thấy sản phẩm nào"
                description={
                  searchQuery
                    ? `Không tìm thấy sản phẩm nào khớp với từ khóa "${searchQuery}".`
                    : 'Danh mục này hiện chưa có sản phẩm từ backend.'
                }
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Menu;
