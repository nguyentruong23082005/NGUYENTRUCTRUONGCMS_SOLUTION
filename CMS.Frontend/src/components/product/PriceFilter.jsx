import React, { useState, useCallback, useRef, useEffect } from 'react';
import styles from './PriceFilter.module.css';

const PriceFilter = ({ onFilterChange }) => {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const debounceRef = useRef(null);

  const emitChange = useCallback((min, max) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({
        minPrice: min ? Number(min) : null,
        maxPrice: max ? Number(max) : null,
      });
    }, 500);
  }, [onFilterChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleMinChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setMinPrice(value);
    emitChange(value, maxPrice);
  };

  const handleMaxChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setMaxPrice(value);
    emitChange(minPrice, value);
  };

  const handleClear = () => {
    setMinPrice('');
    setMaxPrice('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onFilterChange({ minPrice: null, maxPrice: null });
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Lọc theo giá</h3>
      <div className={styles.inputs}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Từ</label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={minPrice}
              onChange={handleMinChange}
              className={styles.input}
            />
            <span className={styles.unit}>₫</span>
          </div>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Đến</label>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="999000"
              value={maxPrice}
              onChange={handleMaxChange}
              className={styles.input}
            />
            <span className={styles.unit}>₫</span>
          </div>
        </div>
      </div>
      {(minPrice || maxPrice) && (
        <button onClick={handleClear} className={styles.clearBtn}>
          ✕ Xóa bộ lọc
        </button>
      )}
    </div>
  );
};

export default PriceFilter;
