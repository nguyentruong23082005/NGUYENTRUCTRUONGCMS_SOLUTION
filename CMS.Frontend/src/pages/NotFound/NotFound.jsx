import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={styles.container}>
      <Helmet>
        <title>Không tìm thấy trang - 404 Not Found</title>
      </Helmet>
      <h1 style={styles.title}>404</h1>
      <h2 style={styles.subtitle}>Không Tìm Thấy Trang</h2>
      <p style={styles.text}>
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị thay đổi.
      </p>
      <Link to="/" style={styles.button}>
        Quay lại Trang chủ
      </Link>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '40px 20px',
    fontFamily: "'Roboto', sans-serif",
  },
  title: {
    fontSize: '96px',
    color: '#006F3C',
    margin: 0,
    lineHeight: 1,
    fontFamily: "'Arimo', sans-serif",
  },
  subtitle: {
    fontSize: '24px',
    color: '#333333',
    marginTop: '16px',
    marginBottom: '8px',
    fontFamily: "'Arimo', sans-serif",
  },
  text: {
    fontSize: '16px',
    color: '#666666',
    marginBottom: '24px',
    maxWidth: '400px',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006F3C',
    color: '#FFFFFF',
    padding: '12px 24px',
    borderRadius: '4px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    minHeight: '40px',
  },
};

export default NotFound;
