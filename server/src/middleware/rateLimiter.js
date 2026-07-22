const rateLimit = require('express-rate-limit');

// Factory functions, not shared singletons - admin login and customer login
// each get their OWN counter bucket. Sharing one instance across both routes
// would mean a burst of wrong customer-login attempts from an IP could also
// lock out the admin login from that same IP (and vice versa), which is a
// worse failure mode than the brute-force risk this is meant to fix.

// Đăng nhập sai không giới hạn số lần trước đây là lỗ hổng brute-force thật -
// giới hạn chặt: 5 lần/15 phút mỗi IP, không tính các lần thành công.
function createLoginLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.' },
  });
}

// Đăng ký/quên mật khẩu ít rủi ro brute-force hơn (không dò được mật khẩu qua
// đây) nhưng vẫn cần chặn spam tạo tài khoản hàng loạt hoặc spam gửi email.
function createAccountActionLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Bạn đã thực hiện thao tác này quá nhiều lần. Vui lòng thử lại sau 15 phút.' },
  });
}

module.exports = { createLoginLimiter, createAccountActionLimiter };
