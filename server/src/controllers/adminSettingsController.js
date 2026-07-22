const prisma = require('../lib/prisma');
const { THEME_ZONE_IDS } = require('../constants/themeZones');

// Chỉ giữ lại zone hợp lệ (có trong THEME_ZONE_IDS) và có ít nhất 1 trong 2
// field (bg/image) khác rỗng - zone không tuỳ chỉnh gì thì bỏ hẳn khỏi JSON
// lưu, để trạng thái "mặc định" gọn và rõ ràng thay vì lưu { bg:null,image:null }
// tràn lan.
function sanitizeThemeZones(input) {
  if (!input || typeof input !== 'object') return null;
  const result = {};
  for (const id of THEME_ZONE_IDS) {
    const z = input[id];
    if (!z || typeof z !== 'object') continue;
    const bg = typeof z.bg === 'string' && z.bg.trim() ? z.bg.trim() : null;
    const image = typeof z.image === 'string' && z.image.trim() ? z.image.trim() : null;
    if (bg || image) result[id] = { bg, image };
  }
  return Object.keys(result).length ? result : null;
}

// Chỉ giữ lại field hợp lệ + bỏ những mục chưa nhập gì (không slug hoặc
// không có ảnh lẫn tiêu đề) - tránh JSON phình to với các dòng rỗng do form
// admin luôn gửi lên đủ 1 dòng cho mỗi danh mục kể cả khi chưa điền.
const BANNER_THEMES = ['theme-amber', 'theme-dark'];
const BANNER_SIDES = ['left', 'right'];
const BANNER_LINK_TYPES = ['product', 'brand', 'category'];

function sanitizeCategoryBanners(input) {
  if (!Array.isArray(input)) return null;
  const result = input
    .map((b) => {
      if (!b || typeof b !== 'object' || !b.categorySlug) return null;
      const image = typeof b.image === 'string' ? b.image.trim() : '';
      const title = typeof b.title === 'string' ? b.title.trim() : '';
      if (!image && !title) return null;
      return {
        categorySlug: b.categorySlug,
        image: image || null,
        eyebrow: typeof b.eyebrow === 'string' ? b.eyebrow.trim() : '',
        title,
        priceLabel: typeof b.priceLabel === 'string' ? b.priceLabel.trim() : '',
        perk: typeof b.perk === 'string' ? b.perk.trim() : '',
        theme: BANNER_THEMES.includes(b.theme) ? b.theme : 'theme-amber',
        side: BANNER_SIDES.includes(b.side) ? b.side : 'left',
        linkType: BANNER_LINK_TYPES.includes(b.linkType) ? b.linkType : 'category',
        linkValue: typeof b.linkValue === 'string' ? b.linkValue.trim() : '',
      };
    })
    .filter(Boolean);
  return result.length ? result : null;
}

// 2 banner phụ cạnh slider chính trang chủ - đơn giản hơn categoryBanners
// (không eyebrow/priceLabel/perk/theme/side, chỉ ảnh + tiêu đề overlay + link),
// vì đây chỉ là banner quảng cáo chung, không gắn với 1 danh mục cụ thể nào.
function sanitizeHeroSideBanners(input) {
  if (!Array.isArray(input)) return null;
  const result = input
    .map((b) => {
      if (!b || typeof b !== 'object') return null;
      const image = typeof b.image === 'string' ? b.image.trim() : '';
      const title = typeof b.title === 'string' ? b.title.trim() : '';
      if (!image) return null;
      return {
        image,
        title,
        linkType: BANNER_LINK_TYPES.includes(b.linkType) ? b.linkType : 'category',
        linkValue: typeof b.linkValue === 'string' ? b.linkValue.trim() : '',
      };
    })
    .filter(Boolean);
  return result.length ? result : null;
}

async function update(req, res) {
  const {
    hotline, chatbotPhone, email, address, companyName, companyTaxCode, workingHours,
    facebookUrl, zaloUrl, youtubeUrl, tiktokUrl, instagramUrl,
    aboutText, coreFeatures, buyingGuideSteps, faqItems, themeZones,
    complianceBadgeImage, complianceBadgeUrl, categoryBanners, pageBackgroundImage,
    heroSideBanners,
  } = req.body;

  if (!hotline || !email || !address || !companyName || !companyTaxCode || !workingHours || !aboutText) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }

  const data = {
    hotline,
    chatbotPhone: chatbotPhone?.trim() || null,
    email,
    address,
    companyName,
    companyTaxCode,
    workingHours,
    facebookUrl: facebookUrl || null,
    zaloUrl: zaloUrl || null,
    youtubeUrl: youtubeUrl || null,
    tiktokUrl: tiktokUrl || null,
    instagramUrl: instagramUrl || null,
    aboutText,
    coreFeatures: Array.isArray(coreFeatures) ? coreFeatures : [],
    buyingGuideSteps: Array.isArray(buyingGuideSteps) ? buyingGuideSteps : [],
    faqItems: Array.isArray(faqItems) ? faqItems : [],
    themeZones: sanitizeThemeZones(themeZones),
    complianceBadgeImage: complianceBadgeImage?.trim() || null,
    complianceBadgeUrl: complianceBadgeUrl?.trim() || null,
    categoryBanners: sanitizeCategoryBanners(categoryBanners),
    pageBackgroundImage: pageBackgroundImage?.trim() || null,
    heroSideBanners: sanitizeHeroSideBanners(heroSideBanners),
  };

  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });

  res.json(settings);
}

module.exports = { update };
