const prisma = require('../lib/prisma');

async function list(req, res) {
  const subscriptions = await prisma.newsletterSubscription.findMany({
    orderBy: { subscribedAt: 'desc' },
    include: { customer: { select: { id: true, name: true, email: true } } },
  });

  res.json(subscriptions);
}

module.exports = { list };
