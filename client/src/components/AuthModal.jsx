import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useSiteSettings } from '../hooks/useSiteSettings';
import * as customerAuthApi from '../api/customerAuth';
import { loginWithFacebookSdk } from '../utils/facebookSdk';
import { renderGoogleButton, isGoogleLoginConfigured } from '../utils/googleSdk';

const EMPTY_FORM = { name: '', email: '', phone: '', password: '', confirmPassword: '', agreeTerms: false, remember: true };

function AuthModal({ show, onClose }) {
  const { login, loginWithGoogle, loginWithFacebook, register } = useCustomerAuth();
  const { settings } = useSiteSettings();
  // Ưu tiên đọc từ Admin > Cài đặt (áp dụng ngay, không cần build lại) - rơi
  // về biến môi trường Vite cũ nếu admin chưa cấu hình trong DB.
  const googleClientId = settings.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const facebookAppId = settings.facebookAppId || import.meta.env.VITE_FACEBOOK_APP_ID || '';
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (!show || (mode !== 'login' && mode !== 'register')) return;
    renderGoogleButton(googleButtonRef.current, handleGoogleCredential, googleClientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, mode, googleClientId]);

  if (!show) return null;

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError('');
    setForgotSent(false);
  }

  function handleClose() {
    setForm(EMPTY_FORM);
    setError('');
    setForgotSent(false);
    setMode('login');
    onClose();
  }

  async function handleLogin(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(form.email, form.password);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    setSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        agreeTerms: form.agreeTerms,
      });
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await customerAuthApi.forgotPassword(form.email);
      setForgotSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleCredential(credential) {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle(credential);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập Google thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFacebookLogin() {
    setError('');
    setSubmitting(true);
    try {
      const accessToken = await loginWithFacebookSdk(facebookAppId);
      await loginWithFacebook(accessToken);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Đăng nhập Facebook thất bại');
    } finally {
      setSubmitting(false);
    }
  }

  function handleGoogleUnconfigured() {
    setError('Chưa cấu hình đăng nhập Google');
  }

  function renderOAuthButtons() {
    return (
      <>
        <div className="d-flex flex-column gap-2 mb-3">
          {isGoogleLoginConfigured(googleClientId) ? (
            <div className="d-flex justify-content-center" ref={googleButtonRef}></div>
          ) : (
            <button
              type="button"
              className="btn btn-outline-dark w-100 fw-bold rounded-pill py-2"
              onClick={handleGoogleUnconfigured}
              disabled={submitting}
            >
              <i className="bi bi-google"></i> Đăng nhập bằng Google
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline-primary w-100 fw-bold rounded-pill py-2"
            onClick={handleFacebookLogin}
            disabled={submitting}
          >
            <i className="bi bi-facebook"></i> Đăng nhập bằng Facebook
          </button>
        </div>
        <div className="d-flex align-items-center gap-2 mb-3">
          <hr className="flex-grow-1" />
          <span className="text-muted small">hoặc</span>
          <hr className="flex-grow-1" />
        </div>
      </>
    );
  }

  return (
    <div className="auth-modal-backdrop" onClick={handleClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="auth-modal-close" onClick={handleClose} aria-label="Đóng">
          <i className="bi bi-x-lg"></i>
        </button>

        {mode === 'login' && (
          <>
            <h4 className="fw-bold mb-1">Chào mừng trở lại!</h4>
            <p className="text-muted small mb-4">Đăng nhập để theo dõi đơn hàng và nhận ưu đãi dành riêng cho bạn.</p>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            {renderOAuthButtons()}
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                />
              </div>
              <div className="mb-2">
                <label className="form-label small fw-bold">Mật khẩu</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                />
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="authRemember"
                    checked={form.remember}
                    onChange={(e) => updateField('remember', e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="authRemember">Ghi nhớ đăng nhập</label>
                </div>
                <button type="button" className="btn btn-link btn-sm p-0 small" onClick={() => switchMode('forgot')}>
                  Quên mật khẩu?
                </button>
              </div>
              <button type="submit" className="btn btn-warning w-100 fw-bold rounded-pill py-2" disabled={submitting}>
                {submitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </button>
            </form>
            <p className="text-center small text-muted mt-3 mb-0">
              Chưa có tài khoản?{' '}
              <button type="button" className="btn btn-link btn-sm p-0 fw-bold" onClick={() => switchMode('register')}>
                Đăng ký ngay
              </button>
            </p>
          </>
        )}

        {mode === 'register' && (
          <>
            <h4 className="fw-bold mb-1">Tạo tài khoản mới</h4>
            <p className="text-muted small mb-4">Mua sắm nhanh hơn và theo dõi đơn hàng dễ dàng.</p>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            {renderOAuthButtons()}
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Họ và tên</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Số điện thoại</label>
                <input
                  type="tel"
                  className="form-control"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Mật khẩu</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="authAgreeTerms"
                  checked={form.agreeTerms}
                  onChange={(e) => updateField('agreeTerms', e.target.checked)}
                  required
                />
                <label className="form-check-label small" htmlFor="authAgreeTerms">
                  Tôi đã đọc và đồng ý với{' '}
                  <Link to="/dieu-khoan-dich-vu" target="_blank" rel="noopener noreferrer">Điều khoản dịch vụ</Link>{' '}
                  và{' '}
                  <Link to="/chinh-sach-bao-mat" target="_blank" rel="noopener noreferrer">Chính sách bảo mật</Link>
                </label>
              </div>
              <button
                type="submit"
                className="btn btn-warning w-100 fw-bold rounded-pill py-2"
                disabled={submitting || !form.agreeTerms}
              >
                {submitting ? 'Đang đăng ký...' : 'Đăng Ký'}
              </button>
            </form>
            <p className="text-center small text-muted mt-3 mb-0">
              Đã có tài khoản?{' '}
              <button type="button" className="btn btn-link btn-sm p-0 fw-bold" onClick={() => switchMode('login')}>
                Đăng nhập
              </button>
            </p>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h4 className="fw-bold mb-1">Quên mật khẩu?</h4>
            <p className="text-muted small mb-4">Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.</p>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            {forgotSent ? (
              <div className="alert alert-success py-2 small">
                Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.
              </div>
            ) : (
              <form onSubmit={handleForgot}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-warning w-100 fw-bold rounded-pill py-2" disabled={submitting}>
                  {submitting ? 'Đang gửi...' : 'Gửi Hướng Dẫn'}
                </button>
              </form>
            )}
            <p className="text-center small text-muted mt-3 mb-0">
              <button type="button" className="btn btn-link btn-sm p-0 fw-bold" onClick={() => switchMode('login')}>
                <i className="bi bi-arrow-left"></i> Quay lại đăng nhập
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
