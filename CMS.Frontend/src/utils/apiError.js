// Tiện ích xử lý lỗi API cho hướng A: chỉ dùng dữ liệu thật.
// Khi backend chưa chạy hoặc API mất kết nối, UI hiển thị trạng thái rỗng/không khả dụng thay vì spam console lỗi đỏ.
export const isNetworkUnavailable = (error) => {
  return Boolean(error?.code === 'ERR_NETWORK' || error?.message === 'Network Error' || !error?.response);
};

export const getApiErrorMessage = (error, fallbackMessage = 'Không thể tải dữ liệu từ hệ thống.') => {
  if (isNetworkUnavailable(error)) {
    return 'Backend API chưa kết nối. Vui lòng khởi động máy chủ API để tải dữ liệu thật.';
  }

  return error?.response?.data?.message || fallbackMessage;
};

export const logApiError = (context, error) => {
  if (isNetworkUnavailable(error)) {
    console.warn(`${context}: Backend API chưa kết nối.`, {
      baseUrl: import.meta.env.VITE_API_URL || 'https://localhost:7296',
    });
    return;
  }

  console.error(context, error);
};
