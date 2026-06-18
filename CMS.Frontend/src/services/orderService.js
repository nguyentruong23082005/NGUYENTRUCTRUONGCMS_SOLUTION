import orderApi from '../api/orderApi';

/**
 * Service xử lý logic nghiệp vụ đơn hàng
 * Chuẩn bị payload đặt hàng từ giỏ hàng + thông tin giao hàng
 */

// Tạo payload đơn hàng chuẩn để gửi lên Backend
export const buildOrderPayload = (cartItems, user, deliveryInfo) => {
  const orderItems = cartItems.map(item => ({
    productId: Number(item.id),
    quantity: item.quantity,
    price: item.price
  }));

  const totalAmount = cartItems.reduce(
    (total, item) => total + (item.price || 0) * item.quantity,
    0
  );

  return {
    customerId: user?.id ? Number(user.id) : null,
    receiverName: deliveryInfo.fullName,
    receiverPhone: deliveryInfo.phone,
    receiverAddress: deliveryInfo.address,
    notes: deliveryInfo.notes || '',
    totalAmount,
    items: orderItems
  };
};

// Gửi đơn hàng lên Backend qua API
export const submitOrder = async (orderPayload) => {
  const response = await orderApi.create(orderPayload);
  return response.data;
};

export default { buildOrderPayload, submitOrder };
