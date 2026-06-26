import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import Loading from '../../components/common/Loading/Loading';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import styles from './ProductDetail.module.css';

const normalizeOptionValues = (values = []) => values.map((value) => ({
  id: Number(value.id),
  name: value.name,
  priceSurcharge: Number(value.priceSurcharge || 0),
  stockQuantity: value.stockQuantity
}));

const normalizeOptionGroups = (groups = []) => groups.map((group) => ({
  id: Number(group.id),
  name: group.name,
  isRequired: Boolean(group.isRequired),
  maxSelectable: Number(group.maxSelectable || 1),
  optionValues: normalizeOptionValues(group.optionValues || group.OptionValues || [])
}));

const buildDefaultSelections = (groups = []) => groups.reduce((selectionMap, group) => {
  if (!group.isRequired) return selectionMap;

  const firstAvailable = group.optionValues.find((value) => value.stockQuantity !== 0);
  if (!firstAvailable) return selectionMap;

  return {
    ...selectionMap,
    [group.id]: [firstAvailable.id]
  };
}, {});

const formatPrice = (price) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
}).format(price || 0);

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [mainImgFailed, setMainImgFailed] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [item, images] = await Promise.all([
          productService.getProductById(id),
          productService.getProductImages(id)
        ]);

        if (item) {
          const optionGroups = normalizeOptionGroups(item.optionGroups || item.OptionGroups || []);

          setProduct({
            ...item,
            skuLabel: item.slug || item.id.toString(),
            price: Number(item.price),
            stockQuantity: Number(item.stockQuantity),
            optionGroups
          });
          setProductImages(images || []);
          setSelectedOptions(buildDefaultSelections(optionGroups));
          setQty(1);
          setMainImgFailed(false); // Reset on product change
        } else {
          setProduct(null);
          setProductImages([]);
        }
      } catch (error) {
        console.error(`Lỗi khi tải chi tiết sản phẩm ${id} từ service:`, error);
        setProduct(null);
        setProductImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const allOptionValues = useMemo(() => {
    if (!product) return [];
    return product.optionGroups.flatMap((group) => group.optionValues);
  }, [product]);

  const selectedOptionValues = useMemo(() => {
    const selectedIds = Object.values(selectedOptions).flat();
    return allOptionValues.filter((value) => selectedIds.includes(value.id));
  }, [allOptionValues, selectedOptions]);

  const optionTotal = selectedOptionValues.reduce((total, value) => total + value.priceSurcharge, 0);
  const unitPrice = (product?.price || 0) + optionTotal;
  const totalPrice = unitPrice * qty;
  const isOutOfStock = !product || product.stockQuantity <= 0;

  const handleOptionToggle = (group, optionValue) => {
    if (optionValue.stockQuantity === 0) return;

    setSelectedOptions((current) => {
      const currentValues = current[group.id] || [];
      const alreadySelected = currentValues.includes(optionValue.id);
      const isSingleChoice = group.maxSelectable <= 1;

      if (isSingleChoice) {
        return {
          ...current,
          [group.id]: [optionValue.id]
        };
      }

      if (alreadySelected) {
        return {
          ...current,
          [group.id]: currentValues.filter((idValue) => idValue !== optionValue.id)
        };
      }

      if (currentValues.length >= group.maxSelectable) {
        return current;
      }

      return {
        ...current,
        [group.id]: [...currentValues, optionValue.id]
      };
    });
  };

  const handleQtyChange = (nextQty) => {
    if (!product) return;
    const normalizedQty = Number(nextQty);
    if (Number.isNaN(normalizedQty)) return;
    setQty(Math.min(product.stockQuantity, Math.max(1, normalizedQty)));
  };

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    addToCart({
      ...product,
      price: unitPrice,
      basePrice: product.price,
      optionTotal,
      selectedOptions: selectedOptionValues,
      optionValueIds: selectedOptionValues.map((value) => value.id),
      cartKey: `${product.id}:${selectedOptionValues.map((value) => value.id).sort((a, b) => a - b).join('-')}`
    }, qty);
  };

  const displayImgUrl = product?.imageUrl && !mainImgFailed ? product.imageUrl : product?.productCategoryImageUrl;

  if (loading) return <Loading fullPage />;
  if (!product) return <EmptyState title="Sản phẩm không tồn tại" description="Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ trong hệ thống." />;

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{`${product.name} - Phúc Long Coffee & Tea`}</title>
      </Helmet>

      <div className="container">
        <nav className={styles.breadcrumbs} aria-label="Điều hướng">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <Link to="/menu">Sản phẩm</Link>
        </nav>

        <section className={styles.layout}>
          <div className={styles.imageArea}>
            <img
              src={displayImgUrl}
              alt={product.name}
              className={styles.image}
              onError={() => setMainImgFailed(true)}
            />
            {isOutOfStock && <div className={styles.outOfStockOverlay}>Tạm hết hàng</div>}
          </div>

          <div className={styles.detailsArea}>
            {product.categoryName && <p className={styles.category}>{product.categoryName}</p>}
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.sku}>SKU: {product.skuLabel}</p>
            {product.isBestSeller && <div className={styles.bestSellerBadge}>Best Seller</div>}
            
            <div className={styles.priceQtyRow}>
              <p className={styles.price}>{formatPrice(product.price)}</p>
              <div className={styles.qtySelector}>
                <button 
                  type="button" 
                  onClick={() => handleQtyChange(qty - 1)} 
                  className={styles.qtyBtn} 
                  aria-label="Giảm số lượng"
                  disabled={isOutOfStock || qty <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(event) => handleQtyChange(event.target.value)}
                  min="1"
                  max={product.stockQuantity}
                  className={styles.qtyInput}
                  aria-label="Số lượng sản phẩm"
                  disabled={isOutOfStock}
                />
                <button 
                  type="button" 
                  onClick={() => handleQtyChange(qty + 1)} 
                  className={styles.qtyBtn} 
                  aria-label="Tăng số lượng" 
                  disabled={isOutOfStock || qty >= product.stockQuantity}
                >
                  +
                </button>
              </div>
            </div>

            {product.optionGroups.map((group) => {
              const isSizeGroup = group.name.toLowerCase().includes('kích cỡ') || group.name.toLowerCase().includes('size');
              const isToppingGroup = group.name.toLowerCase().includes('topping');

              return (
                <section key={group.id} className={styles.optionGroup}>
                  <div className={styles.optionHeader}>
                    <h2>{group.name}</h2>
                    {group.isRequired && <span>Bắt buộc</span>}
                  </div>

                  {isToppingGroup ? (
                    <div className={styles.toppingList}>
                      {group.optionValues.map((optionValue) => {
                        const isSelected = (selectedOptions[group.id] || []).includes(optionValue.id);
                        const isDisabled = optionValue.stockQuantity === 0;

                        return (
                          <div key={optionValue.id} className={styles.toppingRow}>
                            <div className={styles.toppingInfo}>
                              <span className={styles.toppingName}>{optionValue.name}</span>
                              <span className={styles.toppingPrice}>{formatPrice(optionValue.priceSurcharge)}</span>
                            </div>
                            <div className={styles.toppingSelector}>
                              <button 
                                type="button" 
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedOptions(current => ({
                                      ...current,
                                      [group.id]: (current[group.id] || []).filter(id => id !== optionValue.id)
                                    }));
                                  }
                                }} 
                                className={styles.toppingBtn}
                                disabled={!isSelected}
                              >
                                −
                              </button>
                              <span className={styles.toppingQty}>{isSelected ? 1 : 0}</span>
                              <button 
                                type="button" 
                                onClick={() => {
                                  if (!isSelected) {
                                    setSelectedOptions(current => ({
                                      ...current,
                                      [group.id]: [...(current[group.id] || []), optionValue.id]
                                    }));
                                  }
                                }} 
                                className={styles.toppingBtn}
                                disabled={isDisabled}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.optionGrid}>
                      {group.optionValues.map((optionValue) => {
                        const isSelected = (selectedOptions[group.id] || []).includes(optionValue.id);
                        const isDisabled = optionValue.stockQuantity === 0;

                        if (isSizeGroup) {
                          return (
                            <button
                              key={optionValue.id}
                              type="button"
                              className={`${styles.sizeButton} ${isSelected ? styles.sizeSelected : ''}`}
                              onClick={() => handleOptionToggle(group, optionValue)}
                              disabled={isDisabled}
                            >
                              <div className={styles.sizeName}>{optionValue.name}</div>
                              <div className={styles.sizePrice}>
                                {optionValue.priceSurcharge > 0 
                                  ? `+ ${formatPrice(optionValue.priceSurcharge)}` 
                                  : optionValue.priceSurcharge < 0 
                                  ? `- ${formatPrice(Math.abs(optionValue.priceSurcharge))}`
                                  : '0 đ'}
                              </div>
                            </button>
                          );
                        }

                        return (
                          <button
                            key={optionValue.id}
                            type="button"
                            className={`${styles.pillButton} ${isSelected ? styles.pillSelected : ''}`}
                            onClick={() => handleOptionToggle(group, optionValue)}
                            disabled={isDisabled}
                          >
                            {optionValue.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}

            <button type="button" onClick={handleAddToCart} className={styles.buyBtn} disabled={isOutOfStock}>
              {isOutOfStock ? (
                'Tạm hết hàng'
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '8px', verticalAlign: 'middle' }}>add_shopping_cart</span>
                  <span>Thêm vào giỏ hàng : {formatPrice(totalPrice)}</span>
                </>
              )}
            </button>

            {product.description && (
              <div className={styles.descriptionBlock}>
                <h2 className={styles.descriptionTitle}>Giới thiệu sản phẩm</h2>
                <div className={styles.htmlContent} dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
