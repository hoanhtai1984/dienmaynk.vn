const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../lib/prisma');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/mailer');
const { logCustomerActivity } = require('../utils/customerActivityLog');

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 giờ

// Ưu tiên cấu hình lưu trong DB (admin tự điền ở /admin/settings, áp dụng
// ngay không cần deploy lại) - nếu chưa điền thì rơi về biến môi trường
// GOOGLE_CLIENT_ID/FACEBOOK_APP_SECRET trong .env (cách cấu hình cũ). Đọc
// lại DB mỗi lần đăng nhập (không cache) vì tần suất đăng nhập OAuth không
// cao và giá trị hiếm khi đổi.
async function getOAuthConfig() {
  const db = await prisma.oAuthSettings.findUnique({ where: { id: 1 } }).catch(() => null);
  return {
    googleClientId: db?.googleClientId || process.env.GOOGLE_CLIENT_ID || '',
    facebookAppSecret: db?.facebookAppSecret || process.env.FACEBOOK_APP_SECRET || '',
  };
}

function serializeCustomer(customer) {
  return { id: customer.id, name: customer.name, email: customer.email, phone: customer.phone };
}

function signToken(customer) {
  return jwt.sign(
    {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      role: 'customer',
      tokenVersion: customer.tokenVersion,
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

async function register(req, res) {
  const { name, email, phone, password, agreeTerms } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }
  if (!agreeTerms) {
    return res.status(400).json({ error: 'Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật' });
  }

  // Chỉ chặn trùng với tài khoản CÒN hoạt động - email của tài khoản đã bị
  // xoá mềm (deletedAt khác null) được phép đăng ký lại bằng dòng mới.
  const existing = await prisma.customer.findFirst({ where: { email, deletedAt: null } });
  if (existing) return res.status(409).json({ error: 'Email này đã được đăng ký' });

  const hashed = await bcrypt.hash(password, 10);
  const customer = await prisma.customer.create({
    data: { name, email, phone: phone || null, password: hashed },
  });

  // Gửi email chào mừng theo kiểu "best effort" - lỗi gửi email (SMTP down,
  // sai cấu hình...) không được phép làm hỏng việc đăng ký đã thành công.
  sendWelcomeEmail(customer.email, customer.name).catch((err) => {
    console.error('Gửi email chào mừng thất bại:', err.message);
  });

  res.status(201).json({ token: signToken(customer), customer: serializeCustomer(customer) });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' });

  const customer = await prisma.customer.findFirst({ where: { email, deletedAt: null } });
  if (!customer) return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });

  // Tài khoản tạo qua Google/Facebook chưa từng đặt mật khẩu - không có gì để
  // so sánh, và cũng không nên lộ ra bằng thông báo khác "sai email/mật khẩu"
  // (tránh dò xem email nào đã tồn tại qua kiểu lỗi trả về).
  if (!customer.password) return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });

  const valid = await bcrypt.compare(password, customer.password);
  if (!valid) return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });

  res.json({ token: signToken(customer), customer: serializeCustomer(customer) });
}

// Tài khoản OAuth được tìm/tạo theo thứ tự: khớp providerId trước (đã từng
// đăng nhập bằng đúng nút này) -> khớp email (đã có tài khoản email/mật khẩu
// hoặc nút OAuth khác từ trước, gắn thêm providerId vào) -> tạo mới, không
// mật khẩu. Chỉ tự động gắn theo email khi provider xác nhận email đã được
// xác thực (Google: email_verified; Facebook chỉ trả email khi đã xác thực).
async function findOrCreateOAuthCustomer({ providerField, providerId, email, name }) {
  const byProvider = await prisma.customer.findUnique({ where: { [providerField]: providerId } });
  if (byProvider) {
    // Tài khoản đã bị xoá mềm - không cho đăng nhập lại kể cả qua OAuth, trả
    // null để caller (googleLogin/facebookLogin) tự báo lỗi phù hợp.
    return byProvider.deletedAt ? null : byProvider;
  }

  const byEmail = email ? await prisma.customer.findFirst({ where: { email, deletedAt: null } }) : null;
  if (byEmail) {
    return prisma.customer.update({ where: { id: byEmail.id }, data: { [providerField]: providerId } });
  }

  const created = await prisma.customer.create({
    data: { name, email, [providerField]: providerId },
  });
  sendWelcomeEmail(created.email, created.name).catch((err) => {
    console.error('Gửi email chào mừng thất bại:', err.message);
  });
  return created;
}

async function googleLogin(req, res) {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Thiếu thông tin đăng nhập Google' });

  const { googleClientId } = await getOAuthConfig();
  if (!googleClientId) return res.status(400).json({ error: 'Chưa cấu hình đăng nhập Google' });

  let payload;
  try {
    const googleClient = new OAuth2Client(googleClientId);
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: googleClientId });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: 'Xác thực Google thất bại' });
  }

  if (!payload.email_verified) {
    return res.status(401).json({ error: 'Email Google chưa được xác thực' });
  }

  const customer = await findOrCreateOAuthCustomer({
    providerField: 'googleId',
    providerId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email,
  });
  if (!customer) return res.status(401).json({ error: 'Tài khoản này đã bị xóa' });

  res.json({ token: signToken(customer), customer: serializeCustomer(customer) });
}

async function facebookLogin(req, res) {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'Thiếu thông tin đăng nhập Facebook' });

  const { facebookAppSecret } = await getOAuthConfig();
  if (!facebookAppSecret) return res.status(400).json({ error: 'Chưa cấu hình đăng nhập Facebook' });

  const appsecretProof = crypto
    .createHmac('sha256', facebookAppSecret)
    .update(accessToken)
    .digest('hex');

  let profile;
  try {
    const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}&appsecret_proof=${appsecretProof}`;
    const response = await fetch(url);
    profile = await response.json();
    if (!response.ok || !profile.id) throw new Error('invalid facebook token');
  } catch {
    return res.status(401).json({ error: 'Xác thực Facebook thất bại' });
  }

  if (!profile.email) {
    return res.status(400).json({ error: 'Tài khoản Facebook này chưa xác thực email, vui lòng dùng cách đăng nhập khác' });
  }

  const customer = await findOrCreateOAuthCustomer({
    providerField: 'facebookId',
    providerId: profile.id,
    email: profile.email,
    name: profile.name || profile.email,
  });
  if (!customer) return res.status(401).json({ error: 'Tài khoản này đã bị xóa' });

  res.json({ token: signToken(customer), customer: serializeCustomer(customer) });
}

async function me(req, res) {
  const customer = await prisma.customer.findUnique({ where: { id: req.customer.id } });
  if (!customer || customer.deletedAt) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
  res.json(serializeCustomer(customer));
}

// Khách hàng tự sửa hồ sơ - chỉ name/phone, email luôn giữ nguyên (không
// nhận field email trong body dù có gửi lên). Ghi nhật ký dạng "trước -> sau"
// chỉ cho field thực sự đổi, bỏ qua nếu không có gì thay đổi.
async function updateProfile(req, res) {
  if (req.body.email !== undefined) {
    return res.status(400).json({ error: 'Không thể thay đổi email' });
  }
  const { name, phone } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập họ tên' });
  }

  const current = await prisma.customer.findUnique({ where: { id: req.customer.id } });
  if (!current || current.deletedAt) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });

  const nextName = name.trim();
  const nextPhone = phone?.trim() || null;
  const changes = [];
  if (current.name !== nextName) changes.push(`Đổi tên: "${current.name}" → "${nextName}"`);
  if (current.phone !== nextPhone) changes.push(`Đổi SĐT: "${current.phone || '(trống)'}" → "${nextPhone || '(trống)'}"`);

  const updated = await prisma.customer.update({
    where: { id: current.id },
    data: { name: nextName, phone: nextPhone },
  });

  if (changes.length) {
    await logCustomerActivity(updated, { action: 'UPDATE_PROFILE', detail: changes.join('; ') });
  }

  res.json(serializeCustomer(updated));
}

// Xoá mềm - đánh dấu deletedAt thay vì xoá dòng thật (giữ lịch sử đơn hàng +
// vẫn hiện đúng email đã xoá trong báo cáo admin, xem ghi chú ở schema).
// Tăng tokenVersion luôn để token hiện tại (và mọi token cũ khác) hết hiệu
// lực ngay, giống logout/resetPassword.
async function deleteAccount(req, res) {
  const current = await prisma.customer.findUnique({ where: { id: req.customer.id } });
  if (!current || current.deletedAt) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });

  await logCustomerActivity(current, { action: 'DELETE_ACCOUNT', detail: 'Khách hàng tự xóa tài khoản' });

  await prisma.customer.update({
    where: { id: current.id },
    data: { deletedAt: new Date(), tokenVersion: { increment: 1 } },
  });

  res.status(204).send();
}

// Tăng tokenVersion để mọi JWT đã phát hành trước đó (kể cả token đang bị
// đánh cắp) đều bị từ chối ngay từ request tiếp theo, không đợi hết hạn 30 ngày.
async function logout(req, res) {
  await prisma.customer.update({
    where: { id: req.customer.id },
    data: { tokenVersion: { increment: 1 } },
  });
  res.status(204).send();
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Thiếu email' });

  const genericResponse = { message: 'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.' };

  // Chỉ tài khoản còn hoạt động mới được đặt lại mật khẩu - email trùng với
  // dòng đã xoá mềm (nếu có) bị bỏ qua ở đây.
  const customer = await prisma.customer.findFirst({ where: { email, deletedAt: null } });
  if (!customer) return res.json(genericResponse);

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  await prisma.customer.update({
    where: { id: customer.id },
    data: { resetToken: hashedToken, resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
  });

  const resetLink = `${process.env.CLIENT_URL}/dat-lai-mat-khau?token=${rawToken}&email=${encodeURIComponent(email)}`;
  // Best effort - SMTP lỗi/sập (sai cấu hình, provider tạm ngưng...) không
  // được để lộ ra ngoài qua response, vẫn trả cùng thông báo chung để không
  // tiết lộ email nào tồn tại và không làm hỏng luồng quên mật khẩu.
  try {
    await sendPasswordResetEmail(email, resetLink);
  } catch (err) {
    console.error('Gửi email đặt lại mật khẩu thất bại:', err.message);
  }

  res.json(genericResponse);
}

async function resetPassword(req, res) {
  const { email, token, password } = req.body;
  if (!email || !token || !password) return res.status(400).json({ error: 'Thiếu thông tin đặt lại mật khẩu' });
  if (password.length < 6) return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });

  const customer = await prisma.customer.findFirst({ where: { email, deletedAt: null } });
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const valid =
    customer &&
    customer.resetToken === hashedToken &&
    customer.resetTokenExpiry &&
    customer.resetTokenExpiry.getTime() > Date.now();

  if (!valid) return res.status(400).json({ error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn' });

  const hashed = await bcrypt.hash(password, 10);
  await prisma.customer.update({
    where: { id: customer.id },
    // Đặt lại mật khẩu cũng thu hồi mọi phiên đăng nhập cũ (tokenVersion+1) -
    // quan trọng đúng lúc: đây thường là bước xử lý khi nghi ngờ tài khoản bị
    // lộ, nên các token cũ (kể cả token đã bị đánh cắp) phải mất hiệu lực luôn.
    data: { password: hashed, resetToken: null, resetTokenExpiry: null, tokenVersion: { increment: 1 } },
  });

  res.json({ message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ.' });
}

module.exports = {
  register, login, googleLogin, facebookLogin, me, logout, forgotPassword, resetPassword,
  updateProfile, deleteAccount,
};
