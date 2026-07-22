const prisma = require('../lib/prisma');

function serialize(settings) {
  return {
    googleClientId: settings?.googleClientId || '',
    facebookAppId: settings?.facebookAppId || '',
    // Không bao giờ trả mật khẩu thật ra ngoài (kể cả cho admin) - chỉ báo
    // đã lưu hay chưa, giống cách adminMailSettingsController xử lý smtpPass.
    facebookAppSecretSet: !!settings?.facebookAppSecret,
  };
}

async function get(req, res) {
  const settings = await prisma.oAuthSettings.findUnique({ where: { id: 1 } });
  res.json(serialize(settings));
}

async function update(req, res) {
  const { googleClientId, facebookAppId, facebookAppSecret } = req.body;

  const current = await prisma.oAuthSettings.findUnique({ where: { id: 1 } });

  const data = {
    googleClientId: googleClientId?.trim() || null,
    facebookAppId: facebookAppId?.trim() || null,
    // Để trống ô secret = giữ nguyên giá trị đã lưu trước đó - GET không bao
    // giờ trả secret thật nên ô này luôn trống khi mở form, admin chỉ cần
    // điền lại khi thật sự muốn đổi.
    facebookAppSecret: facebookAppSecret?.trim() ? facebookAppSecret.trim() : current?.facebookAppSecret || null,
  };

  const settings = await prisma.oAuthSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });

  res.json(serialize(settings));
}

module.exports = { get, update };
