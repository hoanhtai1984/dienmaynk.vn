const prisma = require('../lib/prisma');
const { logAdminActivity } = require('../utils/activityLog');

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'];

async function list(req, res) {
  const { status } = req.query;
  const where = status ? { status } : {};
  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
}

async function detail(req, res) {
  const id = Number(req.params.id);
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
  res.json(order);
}

async function updateStatus(req, res) {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  }

  const order = await prisma.order.update({ where: { id }, data: { status }, include: { items: true } });

  await logAdminActivity(req, {
    action: 'UPDATE',
    entityType: 'ORDER',
    entityId: order.id,
    detail: `Đổi trạng thái đơn hàng #${order.id} thành "${status}"`,
  });

  res.json(order);
}

module.exports = { list, detail, updateStatus };
