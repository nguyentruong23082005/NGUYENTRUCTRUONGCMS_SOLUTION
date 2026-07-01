import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import categoryApi from '../../api/categoryApi';
import useProducts from '../../hooks/useProducts';
import ProductCard from '../../components/product/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCardSkeleton';
import PriceFilter from '../../components/product/PriceFilter';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import styles from './Menu.module.css';
import productService from '../../services/productService';
import { PRODUCT_BADGE_LABELS, SPECIAL_CATEGORY_SLUGS } from '../../utils/constants';
import { getFullImageUrl } from '../../utils/imageHelper';

const normalizeRouteSlug = (slug = '') => decodeURIComponent(slug).replace(/--c\d+$/i, '');

const normalizeCategory = (item, level = 0) => {
  const children = item.children || item.Children || [];

  return {
    id: String(item.id),
    name: item.name,
    slug: item.slug || '',
    level,
    imageUrl: item.imageUrl ? getFullImageUrl(item.imageUrl) : '',
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

const Menu = () => {
  const { categorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const activeSlug = normalizeRouteSlug(categorySlug || '');

  const [categoryTree, setCategoryTree] = useState([]);
  const [priceFilter, setPriceFilter] = useState({ minPrice: null, maxPrice: null });
  const [bestSellers, setBestSellers] = useState([]);
  const [newestProducts, setNewestProducts] = useState([]);
  const [bestSellerLabel, setBestSellerLabel] = useState(PRODUCT_BADGE_LABELS.BEST_SELLER);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBadgeData = async () => {
      try {
        const [bs, np] = await Promise.all([
          productService.getBestSellers(10),
          productService.getNewestProducts(10)
        ]);
        setBestSellers(bs);
        setNewestProducts(np);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu nhãn:', error);
      }
    };
    fetchBadgeData();
  }, []);

  // Điều khiển đóng/mở danh mục cha độc lập
  const [expandedCategorySlugs, setExpandedCategorySlugs] = useState({});

  const toggleCategory = (slug) => {
    setExpandedCategorySlugs((prev) => ({
      ...prev,
      [slug]: !prev[slug]
    }));
  };

  const { products, pagination, loading } = useProducts({
    pageSize: 12,
    page: currentPage,
    ...(searchQuery ? { q: searchQuery, searchMode: true } : {}),
    ...priceFilter,
    ...(activeSlug ? { categorySlug: activeSlug } : {})
  });

  const categories = useMemo(() => flattenCategories(categoryTree), [categoryTree]);
  const activeCategory = useMemo(
    () => categories.find((category) => category.slug === activeSlug) || null,
    [activeSlug, categories]
  );

  const visibleCategoryTree = categoryTree;

  const goToPage = (pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset trang về 1 khi thay đổi các bộ lọc hoặc từ khóa tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSlug, searchQuery, priceFilter.minPrice, priceFilter.maxPrice]);

  // Tự động mở rộng danh mục cha khi có slug hoạt động (lần đầu tải trang)
  useEffect(() => {
    if (activeSlug && categories.length > 0) {
      const parent = visibleCategoryTree.find(p =>
        p.slug === activeSlug || p.children.some(c => c.slug === activeSlug)
      );
      if (parent) {
        setExpandedCategorySlugs(prev => ({
          ...prev,
          [parent.slug]: true
        }));
      }
    }
  }, [activeSlug, categories, visibleCategoryTree]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getTree();
        const items = response?.data?.data || [];
        const normalized = Array.isArray(items) ? items.map((item) => normalizeCategory(item)) : [];
        setCategoryTree(normalized);

        // Lấy nhãn Best Seller động từ tên danh mục trong database
        const flatCats = flattenCategories(normalized);
        const bsCat = flatCats.find(c => c.slug === SPECIAL_CATEGORY_SLUGS.BEST_SELLER);
        if (bsCat && bsCat.name) {
          setBestSellerLabel(bsCat.name);
        }
      } catch (error) {
        console.error('Không tải được danh mục từ API:', error);
        setCategoryTree([]);
      }
    };

    fetchCategories();
  }, []);


  const groupedSections = useMemo(() => {
    if (searchQuery) {
      return [{
        id: 'search',
        name: `Kết quả tìm kiếm "${searchQuery}"`,
        products: products
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

                const isExpanded = expandedCategorySlugs[category.slug] ?? false;

                return (
                  <div key={category.id} className={styles.categoryGroup}>
                    <Link
                      to={getMenuPath(category)}
                      className={`${styles.parentLink} ${isParentActive ? styles.parentActive : ''}`}
                      onClick={() => toggleCategory(category.slug)}
                    >
                      {category.imageUrl && (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className={styles.categoryIcon}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <span>{category.name}</span>
                    </Link>

                    {isExpanded && category.children.length > 0 && (
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
            <PriceFilter onFilterChange={setPriceFilter} />
          </aside>

          <section className={styles.content}>
            {loading ? (
              <div className={styles.grid}>
                {Array.from({ length: 5 }).map((_, index) => <ProductCardSkeleton key={index} />)}
              </div>
            ) : groupedSections.length > 0 ? (
              <>
                {groupedSections.map((section) => (
                  <section key={section.id} className={styles.productSection}>
                    <h2 className={styles.sectionTitle}>{formatSectionTitle(section.name)}</h2>
                    <div className={styles.grid}>
                      {section.products.map((product) => {
                        const isBest = bestSellers.some((bp) => bp.id.toString() === product.id.toString());
                        const isNew = newestProducts.some((np) => np.id.toString() === product.id.toString());
                        let badgeLabel = '';
                        if (isBest) badgeLabel = bestSellerLabel;
                        else if (isNew) badgeLabel = PRODUCT_BADGE_LABELS.NEWEST;

                        return (
                          <ProductCard
                            key={product.id}
                            product={product}
                            badgeLabel={badgeLabel}
                          />
                        );
                      })}
                    </div>
                  </section>
                ))}

                {pagination.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
                    {Array.from({ length: pagination.totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      const active = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => goToPage(pageNum)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: '1px solid #0c713d',
                            background: active ? '#0c713d' : '#fff',
                            color: active ? '#fff' : '#0c713d',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title={
                  searchQuery || priceFilter.minPrice || priceFilter.maxPrice
                    ? 'Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn'
                    : 'Không tìm thấy sản phẩm nào'
                }
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
