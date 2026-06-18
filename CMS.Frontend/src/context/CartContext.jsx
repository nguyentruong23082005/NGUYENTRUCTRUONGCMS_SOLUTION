import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

// Context quản lý trạng thái giỏ hàng toàn cục (Đồng bộ localStorage và hỗ trợ cơ chế gộp giỏ hàng khách/thành viên)
const CartContext = createContext(null);

const getCartItemKey = (item) => item.cartKey || item.id;

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [guestCartToMerge, setGuestCartToMerge] = useState([]);
  
  // Trạng thái hiển thị Toast thông báo
  const [toast, setToast] = useState(null);
  // Trạng thái kích hoạt hiệu ứng nảy icon giỏ hàng ở Header
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  
  // Lưu giữ trạng thái người dùng trước đó để phát hiện sự kiện Login/Logout
  const prevUserRef = useRef(user);

  // Hàm hiển thị Toast thông báo nhanh trong 3 giây
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev && prev.message === message ? null : prev);
    }, 3000);
  };

  // Kích hoạt hiệu ứng nảy badge giỏ hàng trên Header khi thêm món thành công
  const triggerCartAnimation = () => {
    setIsCartAnimating(true);
    setTimeout(() => {
      setIsCartAnimating(false);
    }, 1000);
  };

  // 1. Logic tải và đồng bộ giỏ hàng khi có sự thay đổi trạng thái đăng nhập (Guest vs User)
  useEffect(() => {
    const prevUser = prevUserRef.current;
    
    if (!prevUser && user) {
      // SỰ KIỆN ĐĂNG NHẬP: Từ khách vãng lai -> Thành viên
      const guestCartJson = localStorage.getItem('cart_guest');
      const guestCart = guestCartJson ? JSON.parse(guestCartJson) : [];
      
      if (guestCart.length > 0) {
        // Có sản phẩm trong giỏ tạm: hiển thị modal xác nhận gộp giỏ hàng
        setGuestCartToMerge(guestCart);
        setShowMergeModal(true);
      } else {
        // Giỏ tạm trống: tải trực tiếp giỏ hàng cá nhân từ trước của user
        const userCartJson = localStorage.getItem(`cart_user_${user.id}`);
        const userCart = userCartJson ? JSON.parse(userCartJson) : [];
        setCartItems(userCart);
      }
    } else if (prevUser && !user) {
      // SỰ KIỆN ĐĂNG XUẤT: Từ thành viên -> Khách vãng lai
      // Dọn sạch giỏ hàng active và giỏ tạm trên thiết bị để đảm bảo an toàn thông tin
      setCartItems([]);
      localStorage.removeItem('cart_guest');
      showToast('Đã đăng xuất, giỏ hàng thiết bị đã được dọn sạch.', 'info');
    } else {
      // Khi F5 hoặc khởi tạo trang web ban đầu
      if (user) {
        const userCartJson = localStorage.getItem(`cart_user_${user.id}`);
        setCartItems(userCartJson ? JSON.parse(userCartJson) : []);
      } else {
        const guestCartJson = localStorage.getItem('cart_guest');
        setCartItems(guestCartJson ? JSON.parse(guestCartJson) : []);
      }
    }
    
    prevUserRef.current = user;
  }, [user]);

  // 2. Tự động ghi nhận giỏ hàng xuống localStorage mỗi khi cartItems hoặc user thay đổi
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_user_${user.id}`, JSON.stringify(cartItems));
    } else {
      localStorage.setItem('cart_guest', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // Xử lý logic trộn giỏ hàng (Guest Cart + User Cart) sau khi được người dùng xác nhận
  const handleMergeCart = (agree) => {
    const userCartKey = `cart_user_${user.id}`;
    const userCartJson = localStorage.getItem(userCartKey);
    const userCart = userCartJson ? JSON.parse(userCartJson) : [];

    if (agree) {
      // Đồng ý: Cộng gộp giỏ tạm vào giỏ thành viên
      const mergedCart = [...userCart];
      guestCartToMerge.forEach((guestItem) => {
        const guestKey = getCartItemKey(guestItem);
        const existingItemIndex = mergedCart.findIndex(
          (item) => getCartItemKey(item) === guestKey
        );
        if (existingItemIndex > -1) {
          // Cộng gộp số lượng và giới hạn theo tồn kho tối đa của sản phẩm (Mã số 42)
          const existingItem = mergedCart[existingItemIndex];
          const newQty = existingItem.quantity + guestItem.quantity;
          const maxStock = guestItem.stockQuantity ?? 999;
          mergedCart[existingItemIndex] = {
            ...existingItem,
            quantity: Math.min(newQty, maxStock)
          };
        } else {
          mergedCart.push(guestItem);
        }
      });
      setCartItems(mergedCart);
      showToast('Đồng bộ giỏ hàng thành công!');
    } else {
      // Từ chối: Thay thế bằng giỏ hàng cá nhân thành viên, bỏ qua giỏ hàng tạm
      setCartItems(userCart);
      showToast('Đã tải giỏ hàng cá nhân thành viên.');
    }
    
    // Dọn sạch giỏ hàng tạm thời sau khi xử lý xong
    localStorage.removeItem('cart_guest');
    setGuestCartToMerge([]);
    setShowMergeModal(false);
  };

  // Thêm sản phẩm vào giỏ hàng (Kiểm tra tồn kho chặt chẽ - Mã số 42)
  const addToCart = (product, quantity = 1) => {
    const maxStock = product.stockQuantity !== undefined ? product.stockQuantity : 99;
    
    setCartItems((prevItems) => {
      const productKey = getCartItemKey(product);
      const existingItemIndex = prevItems.findIndex((item) => getCartItemKey(item) === productKey);
      
      if (existingItemIndex > -1) {
        const existingItem = prevItems[existingItemIndex];
        const currentQty = existingItem.quantity;
        if (currentQty + quantity > maxStock) {
          showToast('Số lượng sản phẩm trong kho không đủ!', 'error');
          return prevItems;
        }
        
        const newItems = prevItems.map((item, index) => (
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
        showToast(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
        triggerCartAnimation();
        return newItems;
      }

      if (quantity > maxStock) {
        showToast('Số lượng sản phẩm trong kho không đủ!', 'error');
        return prevItems;
      }
      
      showToast(`Đã thêm ${product.name} vào giỏ hàng!`);
      triggerCartAnimation();
      return [...prevItems, { ...product, cartKey: productKey, quantity }];
    });
  };

  // Cập nhật số lượng sản phẩm trong giỏ hàng (Chặn vượt tồn kho - Mã số 42)
  const updateCartQuantity = (cartItemKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemKey);
      return;
    }

    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex((item) => getCartItemKey(item) === cartItemKey);
      if (itemIndex === -1) return prevItems;
      
      const item = prevItems[itemIndex];
      const maxStock = item.stockQuantity !== undefined ? item.stockQuantity : 99;
      
      if (newQuantity > maxStock) {
        showToast('Số lượng sản phẩm trong kho không đủ!', 'error');
        return prevItems;
      }
      
      const newItems = prevItems.map((cartItem, index) => (
        index === itemIndex ? { ...cartItem, quantity: newQuantity } : cartItem
      ));
      return newItems;
    });
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (cartItemKey) => {
    setCartItems((prevItems) => {
      const item = prevItems.find((i) => getCartItemKey(i) === cartItemKey);
      if (item) {
        showToast(`Đã xóa ${item.name} khỏi giỏ hàng.`, 'info');
      }
      return prevItems.filter((item) => getCartItemKey(item) !== cartItemKey);
    });
  };

  // Dọn sạch giỏ hàng (Thực hiện khi thanh toán/đặt hàng thành công)
  const clearCart = () => {
    setCartItems([]);
    if (user) {
      localStorage.removeItem(`cart_user_${user.id}`);
    } else {
      localStorage.removeItem('cart_guest');
    }
  };

  // Tính tổng số lượng sản phẩm trong giỏ (Mã số 41)
  const cartTotalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Tính tổng số tiền trong giỏ hàng (Mã số 28)
  const cartTotalPrice = cartItems.reduce(
    (total, item) => total + (item.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalQuantity,
        cartTotalPrice,
        showMergeModal,
        setShowMergeModal,
        guestCartCount: guestCartToMerge.length,
        handleMergeCart,
        toast,
        showToast,
        isCartAnimating
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
