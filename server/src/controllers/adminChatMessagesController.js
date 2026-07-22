const prisma = require('../lib/prisma');

async function list(req, res) {
  const { needsHelp } = req.query;
  const where = needsHelp === 'true' ? { needsHelp: true } : {};

  const messages = await prisma.chatMessage.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { customer: { select: { id: true, name: true, email: true } } },
  });

  res.json(messages);
}

module.exports = { list };
