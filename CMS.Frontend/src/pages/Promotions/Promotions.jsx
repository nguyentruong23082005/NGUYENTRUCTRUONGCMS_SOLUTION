import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PostGrid from '../../components/home/PostGrid';
import styles from './Promotions.module.css';

const Promotions = () => {
  return (
    <main className={styles.page}>
      <Helmet>
        <title>Khuyến mãi - Phúc Long Coffee & Tea</title>
      </Helmet>

      <div className="container">
        <nav className="breadcrumb-nav" aria-label="Điều hướng">
          <Link to="/">Trang chủ</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-active">Khuyến mãi</span>
        </nav>
      </div>

      <PostGrid
        title=""
        subtitle=""
        pageSize={12}
        variant="listing"
        showSummary={false}
        showReadMore={false}
      />
    </main>
  );
};

export default Promotions;
