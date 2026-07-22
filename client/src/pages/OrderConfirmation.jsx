import { Link, useLocation, Navigate } from 'react-router-dom';
import { formatMoney } from '../utils/format';

const PAYMENT_LABEL = {
  COD: 'Thanh toán khi nhận hàng (COD)',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
};

function OrderConfirmation() {
  const { state } = useLocation();
  const order = state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="py-5 bg-light">
      <div className="container">
        <div className="bg-white p-4 p-md-5 rounded-3 border shadow-sm text-center mx-auto" style={{ maxWidth: 640 }}>
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3.5rem' }}></i>
          <h2 className="fw-bold mt-3 mb-2">Đặt hàng thành công!</h2>
          <p className="text-muted mb-4">Cảm ơn bạn đã mua sắm tại Điện Máy NK. Chúng tôi sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.</p>

          <div className="bg-light rounded-3 p-4 text-start mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Mã đơn hàng:</span>
              <span className="fw-bold">{order.code}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Người nhận:</span>
              <span className="fw-bold">{order.customerName}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Số điện thoại:</span>
              <span className="fw-bold">{order.phone}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Địa chỉ:</span>
              <span className="fw-bold text-end">{order.address}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Thanh toán:</span>
              <span className="fw-bold">{PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}</span>
            </div>
            <hr />
            {order.items.map((item) => (
              <div className="d-flex justify-content-between small mb-1" key={item.id}>
                <span>{item.name} x{item.quantity}</span>
                <span>{formatMoney(item.price * item.quantity)}</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold">Tổng tiền:</span>
              <span className="fs-5 fw-bold text-danger">{formatMoney(order.total)}</span>
            </div>
          </div>

          <Link to="/" className="btn btn-warning fw-bold rounded-pill px-4">Về trang chủ</Link>
        </div>
      </div>
    </main>
  );
}

export default OrderConfirmation;
