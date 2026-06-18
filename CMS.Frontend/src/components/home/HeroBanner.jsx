import React, { useEffect, useState } from 'react';
import bannerApi from '../../api/bannerApi';
import { getApiErrorMessage, logApiError } from '../../utils/apiError';
import styles from './HeroBanner.module.css';

const normalizeBanners = (items) => {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      id: String(item.id),
      image: item.imageUrl || item.image || item.bannerUrl || '',
      alt: item.title || item.name || 'Banner Phúc Long',
    }))
    .filter((banner) => banner.image);
};

const HeroBanner = () => {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await bannerApi.getAllActive();
        const items = response?.data?.data?.items || response?.data?.data || [];
        const normalized = normalizeBanners(items);
        setBanners(normalized);
        setErrorMessage('');
      } catch (error) {
        logApiError('Không tải được banner trang chủ', error);
        setBanners([]);
        setErrorMessage(getApiErrorMessage(error, 'Không thể tải banner từ hệ thống.'));
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  if (loading) {
    return <section className={`${styles.slider} ${styles.loading}`} aria-label="Đang tải banner Phúc Long" />;
  }

  if (banners.length === 0) {
    return (
      <section className={styles.emptyHero} aria-label="Banner Phúc Long">
        <strong>Chưa có banner từ hệ thống.</strong>
        <span>{errorMessage || 'Backend API đang trả về danh sách banner rỗng.'}</span>
      </section>
    );
  }

  return (
    <section className={styles.slider} aria-label="Banner Phúc Long">
      {banners.length > 1 && (
        <button type="button" onClick={handlePrev} className={`${styles.arrow} ${styles.arrowLeft}`} aria-label="Banner trước">
          ❮
        </button>
      )}

      <div className={styles.slidesContainer}>
        {banners.map((banner, index) => (
          <div key={banner.id} className={`${styles.slide} ${index === activeIndex ? styles.active : ''}`}>
            <img src={banner.image} alt={banner.alt} className={styles.bannerImage} />
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <button type="button" onClick={handleNext} className={`${styles.arrow} ${styles.arrowRight}`} aria-label="Banner tiếp theo">
          ❯
        </button>
      )}

      {banners.length > 1 && (
        <div className={styles.dots}>
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Chuyển tới banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroBanner;
