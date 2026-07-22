import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatMoney } from '../utils/format';
import { resolveImageUrl, onImgError } from '../utils/resolveImageUrl';
import { productUrl } from '../utils/productUrl';
import { createOrder } from '../api/orders';

function CartRow({ item, onUpdateQty, onRemove }) {
  function handleRemove() {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?')) {
      onRemove(item.id);
    }
  }

  return (
    <div className="row align-items-center py-3 border-bottom cart-item">
      <div className="col-md-6 col-12 mb-3 mb-md-0">
        <div className="d-flex align-items-center gap-3">
          <img
            src={resolveImageUrl(item.image)}
            alt={item.name}
            className="img-fluid border rounded"
            style={{ width: 80, height: 80, objectFit: 'contain' }}
            onError={onImgError}
          />
          <div>
            <h6 className="fw-bold mb-1">
              <Link to={productUrl(item)} className="text-dark text-decoration-none">{item.name}</Link>
            </h6>
            <span className="text-muted small">Thương hiệu: {item.brand}</span>
            <button className="btn btn-link btn-sm text-danger p-0 d-block mt-1 text-decoration-none" onClick={handleRemove}>
              <i className="bi bi-trash3"></i> Xóa khỏi giỏ
            </button>
          </div>
        </div>
      </div>
      <div className="col-md-2 col-4 text-start text-md-center">
        <span className="d-md-none text-muted small">Giá: </span>
        <span className="fw-bold">{formatMoney(item.price)}</span>
      </div>
      <div className="col-md-2 col-4 text-center">
        <div className="input-group input-group-sm justify-content-center">
          <button
            className="btn btn-outline-secondary px-2"
            type="button"
            onClick={() => item.qty > 1 && onUpdateQty(item.id, item.qty - 1)}
          >
            -
          </button>
          <input type="text" className="form-control text-center" value={item.qty} style={{ maxWidth: 40 }} readOnly />
          <button className="btn btn-outline-secondary px-2" type="button" onClick={() => onUpdateQty(item.id, item.qty + 1)}>
            +
          </button>
        </div>
      </div>
      <div className="col-md-2 col-4 text-end">
        <span className="d-md-none text-muted small">Tổng: </span>
        <span className="fw-bold text-danger">{formatMoney(item.price * item.qty)}</span>
      </div>
    </div>
  );
}

function Cart() {
  const { cart, totalCount, totalPrice, removeItem, updateQty, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', phone: '', address: '', payment: 'COD' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (cart.length === 0) return;
    setSubmitting(true);
    setError('');

    try {
      const order = await createOrder({
        customerName: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        paymentMethod: form.payment,
        items: cart.map((item) => ({ productId: item.id, quantity: item.qty })),
      });
      clearCart();
      navigate('/dat-hang-thanh-cong', { state: { order } });
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="py-5 bg-light">
      <div className="container">
        <h2 className="fw-bold mb-4">
          <i className="bi bi-cart-check-fill text-warning"></i> Giỏ Hàng ({totalCount} sản phẩm)
        </h2>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="bg-white p-4 rounded-3 border shadow-sm">
              {cart.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-cart-x text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3 mb-3">Giỏ hàng của bạn đang trống.</p>
                  <Link to="/" className="btn btn-warning fw-bold rounded-pill px-4">Tiếp tục mua sắm</Link>
                </div>
              ) : (
                <>
                  <div className="row border-bottom pb-2 mb-3 fw-bold text-muted d-none d-md-flex small">
                    <div className="col-md-6">Sản phẩm</div>
                    <div className="col-md-2 text-center">Giá tiền</div>
                    <div className="col-md-2 text-center">Số lượng</div>
                    <div className="col-md-2 text-end">Thành tiền</div>
                  </div>
                  <div>
                    {cart.map((item) => (
                      <CartRow key={item.id} item={item} onUpdateQty={updateQty} onRemove={removeItem} />
                    ))}
                  </div>
                  <div className="mt-3">
                    <Link to="/danh-muc" className="btn btn-outline-dark btn-sm rounded-pill px-3">
                      <i className="bi bi-arrow-left"></i> Tiếp tục mua sắm
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="bg-white p-4 rounded-3 border shadow-sm mb-4">
              <h5 className="fw-bold mb-3 pb-2 border-bottom">Tóm tắt đơn hàng</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tạm tính:</span>
                <span className="fw-bold text-dark">{formatMoney(totalPrice)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Phí vận chuyển:</span>
                <span className="text-success fw-bold">Miễn phí</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-center mb-0">
                <span className="fw-bold">Tổng tiền thanh toán:</span>
                <span className="fs-4 fw-bold text-danger">{formatMoney(totalPrice)}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-3 border shadow-sm">
              <h5 className="fw-bold mb-3 pb-2 border-bottom">
                <i className="bi bi-truck text-primary"></i> Thông tin giao hàng
              </h5>
              <form onSubmit={handleSubmit}>
                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                <div className="mb-3">
                  <label className="form-label small fw-bold">Họ và tên *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Nhập tên người nhận"
                    value={form.name}
                    onChange={handleChange('name')}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Số điện thoại *</label>
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    placeholder="Nhập số điện thoại"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Địa chỉ nhận hàng *</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={3}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    value={form.address}
                    onChange={handleChange('address')}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-bold">Phương thức thanh toán</label>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment-method"
                      id="pay-cod"
                      checked={form.payment === 'COD'}
                      onChange={() => setForm((prev) => ({ ...prev, payment: 'COD' }))}
                    />
                    <label className="form-check-label small" htmlFor="pay-cod">Thanh toán khi nhận hàng (COD)</label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment-method"
                      id="pay-bank"
                      checked={form.payment === 'BANK_TRANSFER'}
                      onChange={() => setForm((prev) => ({ ...prev, payment: 'BANK_TRANSFER' }))}
                    />
                    <label className="form-check-label small" htmlFor="pay-bank">Chuyển khoản ngân hàng (Qua mã QR)</label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-warning w-100 py-2 fw-bold text-dark rounded-pill fs-5"
                  disabled={cart.length === 0 || submitting}
                >
                  <i className="bi bi-bag-check-fill"></i> {submitting ? 'Đang xử lý...' : 'XÁC NHẬN ĐẶT HÀNG'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Cart;
