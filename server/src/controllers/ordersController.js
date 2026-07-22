const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { generateOrderCode } = require('../utils/orderCode');

// Đặt hàng không bắt buộc đăng nhập (guest checkout). Nếu request có kèm
// token khách hàng hợp lệ thì gắn đơn hàng vào tài khoản đó, ngược lại (không
// có token, token hết hạn/không hợp lệ) vẫn cho đặt hàng bình thường.
function getOptionalCustomerId(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload.role === 'customer' ? payload.id : null;
  } catch {
    return null;
  }
}

async function create(req, res) {
  const { customerName, phone, address, note, paymentMethod, items } = req.body;

  if (!customerName || !phone || !address) {
    return res.status(400).json({ error: 'Thiếu họ tên, số điện thoại hoặc địa chỉ' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Giỏ hàng trống' });
  }
  if (paymentMethod && !['COD', 'BANK_TRANSFER'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'Phương thức thanh toán không hợp lệ' });
  }

  const productIds = items.map((it) => Number(it.productId));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { images: true },
  });
  const productById = new Map(products.map((p) => [p.id, p]));

  const orderItemsData = [];
  let total = 0;

  for (const item of items) {
    const product = productById.get(Number(item.productId));
    const quantity = Math.max(1, Math.min(99, Number(item.quantity) || 1));
    if (!product) {
      return res.status(400).json({ error: `Sản phẩm id=${item.productId} không tồn tại` });
    }
    const cover = [...product.images].sort((a, b) => a.position - b.position)[0];
    orderItemsData.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: cover ? cover.url : null,
    });
    total += product.price * quantity;
  }

  const order = await prisma.order.create({
    data: {
      code: generateOrderCode(),
      customerId: getOptionalCustomerId(req),
      customerName,
      phone,
      address,
      note: note || null,
      paymentMethod: paymentMethod || 'COD',
      total,
      items: { create: orderItemsData },
    },
    include: { items: true },
  });

  res.status(201).json(order);
}

module.exports = { create };
