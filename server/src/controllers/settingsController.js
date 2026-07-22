const prisma = require('../lib/prisma');

async function get(req, res) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (!settings) return res.status(404).json({ error: 'Chưa cấu hình site' });

  // googleClientId/facebookAppId KHÔNG bí mật (client cần để vẽ nút đăng
  // nhập) nên gộp vào response công khai này - facebookAppSecret thì tuyệt
  // đối không, chỉ có ở route admin riêng (adminOAuthSettingsController.js).
  const oauth = await prisma.oAuthSettings.findUnique({ where: { id: 1 } });
  res.json({
    ...settings,
    googleClientId: oauth?.googleClientId || null,
    facebookAppId: oauth?.facebookAppId || null,
  });
}

module.exports = { get };
