import React, { useEffect, useMemo, useState } from 'react';
import { useCart } from '../../context/CartContext';
import productService from '../../services/productService';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  buildDefaultSelections,
  formatOptionDelta,
  getAdjustedOptionSurcharge,
  getAdjustedOptionTotal,
  getSelectedOptionValuesWithGroups,
  normalizeOptionGroups
} from '../../utils/productOptions';
import styles from './QuickOrderModal.module.css';

const QuickOrderModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [detailProduct, setDetailProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadProduct = async () => {
      if (!product?.id) return;

      setLoading(true);
      try {
        const item = await productService.getProductById(product.id);
        if (!isActive) return;

        const source = item || product;
        const optionGroups = normalizeOptionGroups(source.optionGroups || source.OptionGroups || []);
        const nextProduct = {
          ...product,
          ...source,
          id: source.id?.toString?.() || product.id?.toString?.(),
          price: Number(source.price || product.price || 0),
          stockQuantity: Number(source.stockQuantity ?? product.stockQuantity ?? 0),
          optionGroups
        };

        setDetailProduct(nextProduct);
        setSelectedOptions(buildDefaultSelections(optionGroups, nextProduct.name));
        setQty(1);
        setImgFailed(false);
      } catch (error) {
        console.error('Lỗi khi tải thông tin sản phẩm để đặt nhanh:', error);
        if (!isActive) return;

        const fallbackGroups = normalizeOptionGroups(product.optionGroups || product.OptionGroups || []);
        setDetailProduct({
          ...product,
          price: Number(product.price || 0),
          stockQuantity: Number(product.stockQuantity ?? 0),
          optionGroups: fallbackGroups
        });
        setSelectedOptions(buildDefaultSelections(fallbackGroups, product.name));
      } finally {
        if (isActive) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      isActive = false;
    };
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const allOptionValues = useMemo(() => {
    if (!detailProduct) return [];
    return detailProduct.optionGroups.flatMap((group) => group.optionValues);
  }, [detailProduct]);

  const selectedOptionValues = useMemo(() => (
    detailProduct
      ? getSelectedOptionValuesWithGroups(detailProduct.optionGroups, selectedOptions).map(({ optionValue }) => optionValue)
      : []
  ), [detailProduct, selectedOptions]);

  const optionTotal = useMemo(() => (
    detailProduct ? getAdjustedOptionTotal(detailProduct.optionGroups, selectedOptions, detailProduct.name) : 0
  ), [detailProduct, selectedOptions]);
  const unitPrice = (detailProduct?.price || 0) + optionTotal;
  const totalPrice = unitPrice * qty;
  const isOutOfStock = !detailProduct || detailProduct.stockQuantity <= 0;

  const handleQtyChange = (nextQty) => {
    if (!detailProduct) return;
    const normalizedQty = Number(nextQty);
    if (Number.isNaN(normalizedQty)) return;
    setQty(Math.min(detailProduct.stockQuantity, Math.max(1, normalizedQty)));
  };

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

      if (currentValues.length >= group.maxSelectable) return current;

      return {
        ...current,
        [group.id]: [...currentValues, optionValue.id]
      };
    });
  };

  const handleAddToCart = () => {
    if (!detailProduct || isOutOfStock) return;

    addToCart({
      ...detailProduct,
      price: unitPrice,
      basePrice: detailProduct.price,
      optionTotal,
      selectedOptions: selectedOptionValues,
      optionValueIds: selectedOptionValues.map((value) => value.id),
      cartKey: `${detailProduct.id}:${selectedOptionValues.map((value) => value.id).sort((a, b) => a - b).join('-')}`
    }, qty);

    onClose();
  };

  const imageUrl = detailProduct?.imageUrl && !imgFailed
    ? detailProduct.imageUrl
    : detailProduct?.productCategoryImageUrl;

  return (
    <div className={styles.overlay} onMouseDown={onClose} role="presentation">
      <div className={styles.modal} onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Chọn sản phẩm">
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Đóng">×</button>

        {loading ? (
          <div className={styles.loading}>Đang tải sản phẩm...</div>
        ) : (
          <>
            <div className={styles.imagePanel}>
              {imageUrl ? (
                <img src={imageUrl} alt={detailProduct.name} className={styles.productImage} onError={() => setImgFailed(true)} />
              ) : (
                <span className={styles.imageFallback}>PHÚC LONG</span>
              )}
            </div>

            <div className={styles.infoPanel}>
              <div className={styles.infoScroll}>
                <h2 className={styles.title}>{detailProduct.name}</h2>
                {detailProduct.description && <p className={styles.description}>{detailProduct.description.replace(/<[^>]*>/g, '').slice(0, 90)}</p>}

                <div className={styles.priceQtyRow}>
                  <span className={styles.price}>{formatCurrency(detailProduct.price)}</span>
                  <div className={styles.qtySelector}>
                    <button type="button" className={styles.qtyBtn} onClick={() => handleQtyChange(qty - 1)} disabled={qty <= 1}>−</button>
                    <span className={styles.qtyNum}>{qty}</span>
                    <button type="button" className={styles.qtyBtn} onClick={() => handleQtyChange(qty + 1)} disabled={isOutOfStock || qty >= detailProduct.stockQuantity}>+</button>
                  </div>
                </div>

                {detailProduct.optionGroups.map((group) => {
                  const groupName = group.name.toLowerCase();
                  const isSizeGroup = groupName.includes('kích cỡ') || groupName.includes('size');
                  const isToppingGroup = groupName.includes('topping');

                  return (
                    <section key={group.id} className={styles.optionGroup}>
                      <h3 className={styles.optionTitle}>{group.name}</h3>

                      {isToppingGroup ? (
                        <div className={styles.toppingList}>
                          {group.optionValues.map((optionValue) => {
                            const isSelected = (selectedOptions[group.id] || []).includes(optionValue.id);
                            const isDisabled = optionValue.stockQuantity === 0;

                            return (
                              <div key={optionValue.id} className={styles.toppingRow}>
                                <div className={styles.toppingInfo}>
                                  <span className={styles.toppingName}>{optionValue.name}</span>
                                  <span className={styles.toppingPrice}>{formatCurrency(optionValue.priceSurcharge)}</span>
                                </div>
                                <div className={styles.toppingSelector}>
                                  <button type="button" className={styles.toppingBtn} disabled={!isSelected} onClick={() => handleOptionToggle(group, optionValue)}>−</button>
                                  <span className={styles.toppingQty}>{isSelected ? 1 : 0}</span>
                                  <button type="button" className={styles.toppingBtn} disabled={isDisabled || isSelected} onClick={() => handleOptionToggle(group, optionValue)}>+</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={isSizeGroup ? styles.sizeGrid : styles.pillGrid}>
                          {group.optionValues.map((optionValue) => {
                            const isSelected = (selectedOptions[group.id] || []).includes(optionValue.id);
                            const isDisabled = optionValue.stockQuantity === 0;

                            return (
                              <button
                                key={optionValue.id}
                                type="button"
                                className={`${isSizeGroup ? styles.sizeButton : styles.pillButton} ${isSelected ? styles.selected : ''}`}
                                onClick={() => handleOptionToggle(group, optionValue)}
                                disabled={isDisabled}
                              >
                                {isSizeGroup ? (
                                  <>
                                    <span>{optionValue.name}</span>
                                    <small>{formatOptionDelta(getAdjustedOptionSurcharge(optionValue, group, detailProduct.name))}</small>
                                  </>
                                ) : optionValue.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>

              <button type="button" className={styles.addBtn} onClick={handleAddToCart} disabled={isOutOfStock}>
                {isOutOfStock ? 'Tạm hết hàng' : `Thêm vào giỏ hàng : ${formatCurrency(totalPrice)}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuickOrderModal;
