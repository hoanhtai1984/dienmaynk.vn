const path = require('path');
const express = require('express');
const cors = require('cors');

const healthRouter = require('./routes/health');
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const searchRouter = require('./routes/search');
const ordersRouter = require('./routes/orders');
const contactRouter = require('./routes/contact');
const authRouter = require('./routes/auth');
const customerAuthRouter = require('./routes/customerAuth');
const postsRouter = require('./routes/posts');
const adminProductsRouter = require('./routes/adminProducts');
const adminOrdersRouter = require('./routes/adminOrders');
const adminReportsRouter = require('./routes/adminReports');
const adminPostsRouter = require('./routes/adminPosts');
const adminCustomersRouter = require('./routes/adminCustomers');
const settingsRouter = require('./routes/settings');
const adminSettingsRouter = require('./routes/adminSettings');
const newsletterRouter = require('./routes/newsletter');
const adminContactsRouter = require('./routes/adminContacts');
const adminChatMessagesRouter = require('./routes/adminChatMessages');
const adminNewsletterRouter = require('./routes/adminNewsletter');
const adminMembersRouter = require('./routes/adminMembers');
const siteStatsRouter = require('./routes/siteStats');
const { sitemap } = require('./controllers/sitemapController');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// CLIENT_URL có thể là danh sách nhiều origin cách nhau bởi dấu phẩy. Ngoài
// production, còn tự cho phép mọi origin dạng localhost/IP mạng LAN riêng
// (192.168.x.x, 10.x.x.x, 172.16-31.x.x) để mở web từ điện thoại thật cùng
// mạng luôn hoạt động mà không cần sửa .env mỗi khi đổi mạng/đổi IP.
const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map((s) => s.trim()).filter(Boolean);
const LAN_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== 'production' && LAN_ORIGIN_RE.test(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Không đặt dưới /api - crawler tìm sitemap.xml ở gốc domain theo quy ước.
app.get('/sitemap.xml', sitemap);

app.use('/api/health', healthRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/search', searchRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/auth', authRouter);
app.use('/api/customer-auth', customerAuthRouter);
app.use('/api/posts', postsRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/orders', adminOrdersRouter);
app.use('/api/admin/reports', adminReportsRouter);
app.use('/api/admin/posts', adminPostsRouter);
app.use('/api/admin/customers', adminCustomersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin/settings', adminSettingsRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/admin/contacts', adminContactsRouter);
app.use('/api/admin/chat-messages', adminChatMessagesRouter);
app.use('/api/admin/newsletter', adminNewsletterRouter);
app.use('/api/admin/members', adminMembersRouter);
app.use('/api/site-stats', siteStatsRouter);

app.use('/api', notFound);
app.use(errorHandler);

module.exports = app;
