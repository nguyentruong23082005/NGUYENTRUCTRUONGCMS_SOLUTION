import React from 'react';
import HeroBanner from '../../components/home/HeroBanner';
import BestSellers from '../../components/home/BestSellers';
import PostGrid from '../../components/home/PostGrid';
import StoreLocator from '../../components/store/StoreLocator';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.home}>
      <HeroBanner />
      <BestSellers />
      <PostGrid />
      <StoreLocator />
    </div>
  );
};

export default Home;
