const prisma = require('../lib/prisma');

const VALID_STATUSES = ['NEW', 'RESOLVED'];

async function list(req, res) {
  const { status } = req.query;
  const where = status && VALID_STATUSES.includes(status) ? { status } : {};

  const messages = await prisma.contactMessage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { customer: { select: { id: true, name: true, email: true } } },
  });

  res.json(messages);
}

async function updateStatus(req, res) {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  }

  const message = await prisma.contactMessage.update({
    where: { id },
    data: { status },
  });
  res.json(message);
}

module.exports = { list, updateStatus };
