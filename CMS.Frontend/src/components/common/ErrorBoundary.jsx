import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={styles.errorContainer}>
          <div style={styles.errorCard}>
            <h2 style={styles.title}>Đã xảy ra sự cố không mong muốn</h2>
            <p style={styles.message}>
              Hệ thống gặp lỗi trong quá trình xử lý dữ liệu. Vui lòng làm mới trang hoặc quay lại sau.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details style={styles.details}>
                <summary style={{ cursor: 'pointer', marginBottom: '8px', color: '#DC2626' }}>
                  Chi tiết lỗi kỹ thuật
                </summary>
                <pre style={styles.pre}>
                  {this.state.error.toString()}
                  <br />
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              style={styles.button}
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#F9F9F9',
    padding: '20px',
    fontFamily: "'Roboto', sans-serif"
  },
  errorCard: {
    maxWidth: '550px',
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    borderTop: '5px solid #006F3C'
  },
  title: {
    color: '#006F3C',
    fontSize: '24px',
    marginBottom: '16px',
    fontFamily: "'Arimo', sans-serif"
  },
  message: {
    color: '#666666',
    fontSize: '16px',
    marginBottom: '24px',
    lineHeight: '1.6'
  },
  details: {
    textAlign: 'left',
    backgroundColor: '#FFF5F5',
    border: '1px solid #FED7D7',
    padding: '16px',
    borderRadius: '4px',
    marginBottom: '24px',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  pre: {
    fontSize: '12px',
    color: '#333333',
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace'
  },
  button: {
    backgroundColor: '#006F3C',
    color: '#FFFFFF',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    minHeight: '40px'
  }
};

export default ErrorBoundary;
