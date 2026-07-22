const prisma = require('../lib/prisma');

function serializePost(post) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    image: post.image,
    category: post.category,
    publishedAt: post.publishedAt,
  };
}

async function list(req, res) {
  const { limit } = req.query;
  const posts = await prisma.post.findMany({
    orderBy: { publishedAt: 'desc' },
    take: limit ? Number(limit) : undefined,
  });
  res.json(posts.map(serializePost));
}

async function detail(req, res) {
  const post = await prisma.post.findUnique({ where: { slug: req.params.slug } });
  if (!post) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  res.json(serializePost(post));
}

module.exports = { list, detail, serializePost };
