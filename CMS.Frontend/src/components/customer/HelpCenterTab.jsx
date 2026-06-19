import React, { useState } from 'react';
import styles from '../../pages/Profile/Profile.module.css';

const HelpCenterTab = () => {
  const [form, setForm] = useState({
    title: '',
    content: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSubmitted(true);
    setForm({ title: '', content: '' });
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <>
      <h2 className={styles.contentTitle}>Trung tâm trợ giúp</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
        {/* Cột trái: Liên hệ & FAQs */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#006F3C' }}>Thông tin liên hệ</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28, fontSize: 14 }}>
            <div>
              <strong>Hotline Đặt Hàng:</strong> <span style={{ color: '#006F3C', fontWeight: 700 }}>1800 6779</span>
            </div>
            <div>
              <strong>Hotline Góp Ý & Khiếu Nại:</strong> <span style={{ color: '#006F3C', fontWeight: 700 }}>1900 2345 18</span>
            </div>
            <div>
              <strong>Email Hỗ Trợ:</strong> <a href="mailto:support@phuclong.com.vn" style={{ color: '#007AFF', textDecoration: 'none' }}>support@phuclong.com.vn</a>
            </div>
            <div>
              <strong>Thời Gian Hoạt Động:</strong> 07:00 - 21:00 (Hàng ngày)
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#333333' }}>Câu hỏi thường gặp</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ borderBottom: '1px solid #ECEFF1', paddingBottom: 12 }}>
              <strong style={{ fontSize: 14, color: '#333333', display: 'block', marginBottom: 4 }}>1. Làm sao để tích lũy điểm thành viên?</strong>
              <span style={{ fontSize: 13, color: '#666666' }}>Khi đặt hàng online qua ứng dụng/website hoặc mua trực tiếp tại quầy, bạn chỉ cần đọc số điện thoại đã đăng ký để được tích điểm.</span>
            </div>
            <div style={{ borderBottom: '1px solid #ECEFF1', paddingBottom: 12 }}>
              <strong style={{ fontSize: 14, color: '#333333', display: 'block', marginBottom: 4 }}>2. Voucher có hạn sử dụng bao lâu?</strong>
              <span style={{ fontSize: 13, color: '#666666' }}>Mỗi voucher có hạn sử dụng khác nhau ghi trên vé giảm giá. Vui lòng kiểm tra tab "Ưu đãi của tôi" để biết chi tiết.</span>
            </div>
            <div style={{ borderBottom: '1px solid #ECEFF1', paddingBottom: 12 }}>
              <strong style={{ fontSize: 14, color: '#333333', display: 'block', marginBottom: 4 }}>3. Tôi muốn hủy đơn hàng vừa đặt thì làm thế nào?</strong>
              <span style={{ fontSize: 13, color: '#666666' }}>Nếu đơn hàng ở trạng thái "Chờ xử lý", bạn có thể nhấn nút "Hủy đơn hàng" trực tiếp trong tab "Đơn hàng". Nếu đơn đã xử lý, vui lòng gọi hotline 1800 6779 để được hỗ trợ gấp.</span>
            </div>
          </div>
        </div>

        {/* Cột phải: Gửi yêu cầu hỗ trợ */}
        <div style={{ background: '#FAFAFA', padding: 24, border: '1px solid #ECEFF1', borderRadius: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#333333' }}>Gửi yêu cầu hỗ trợ</h3>
          {submitted ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: 16, borderRadius: 4, fontSize: 14 }}>
              Yêu cầu của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi lại trong vòng 24h làm việc.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 14, color: '#333333' }} htmlFor="hc-title">Tiêu đề yêu cầu *</label>
                <input
                  id="hc-title"
                  type="text"
                  className={styles.formInput}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Nhập tiêu đề (Ví dụ: Lỗi thanh toán, Sai thông tin...)"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 14, color: '#333333' }} htmlFor="hc-content">Nội dung chi tiết *</label>
                <textarea
                  id="hc-content"
                  className={styles.formInput}
                  style={{ minHeight: 120, resize: 'vertical', fontFamily: 'inherit', padding: 8 }}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                  required
                />
              </div>

              <button type="submit" className={styles.btnPrimary} style={{ alignSelf: 'flex-start' }}>
                Gửi yêu cầu
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default HelpCenterTab;
