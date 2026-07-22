import { useEffect, useState } from 'react';
import {
  getSettings, updateSettings, uploadThemeImage, getMailSettings, updateMailSettings,
  getOAuthSettings, updateOAuthSettings,
} from '../../api/settings';
import { getBrands } from '../../api/categories';
import { useCategories } from '../../hooks/useCategories';
import { resolveImageUrl } from '../../utils/resolveImageUrl';
import { THEME_ZONE_GROUPS } from '../../constants/themeZones';

const BANNER_THEME_LABEL = { 'theme-amber': 'Vàng ấm', 'theme-dark': 'Tối' };
const BANNER_SIDE_LABEL = { left: 'Bên trái', right: 'Bên phải' };
const BANNER_LINK_TYPE_LABEL = { category: 'Danh mục', brand: 'Nhãn hiệu', product: 'Sản phẩm cố định' };

function emptyBanner(categorySlug) {
  return {
    categorySlug, image: '', eyebrow: '', title: '', priceLabel: '', perk: '',
    theme: 'theme-amber', side: 'left', linkType: 'category', linkValue: categorySlug,
  };
}

function emptyHeroBanner() {
  return { image: '', title: '', linkType: 'category', linkValue: '' };
}

// Icon/màu cố định theo đúng thứ tự 4 mục trên trang chủ (xem Home.jsx) -
// admin chỉ sửa được tiêu đề/mô tả, không đổi icon để tránh lệch màu/icon.
const CORE_FEATURE_META = [
  { icon: 'bi-truck', colorClass: 'bg-warning-subtle text-warning' },
  { icon: 'bi-shield-check', colorClass: 'bg-primary-subtle text-primary' },
  { icon: 'bi-arrow-repeat', colorClass: 'bg-success-subtle text-success' },
  { icon: 'bi-percent', colorClass: 'bg-danger-subtle text-danger' },
];
const EMPTY_CORE_FEATURES = CORE_FEATURE_META.map(() => ({ title: '', description: '' }));

const EMPTY_FORM = {
  hotline: '',
  chatbotPhone: '',
  email: '',
  address: '',
  companyName: '',
  companyTaxCode: '',
  workingHours: '',
  facebookUrl: '',
  zaloUrl: '',
  youtubeUrl: '',
  tiktokUrl: '',
  instagramUrl: '',
  aboutText: '',
  complianceBadgeImage: '',
  complianceBadgeUrl: '',
  pageBackgroundImage: '',
};

const EMPTY_MAIL_FORM = { smtpHost: '', smtpPort: '', smtpSecure: false, smtpUser: '', smtpPass: '', mailFrom: '' };
const EMPTY_OAUTH_FORM = { googleClientId: '', facebookAppId: '', facebookAppSecret: '' };

function AdminSettings() {
  const { categories } = useCategories();
  const [form, setForm] = useState(EMPTY_FORM);
  const [coreFeatures, setCoreFeatures] = useState(EMPTY_CORE_FEATURES);
  const [buyingGuideSteps, setBuyingGuideSteps] = useState([{ title: '', description: '' }]);
  const [faqItems, setFaqItems] = useState([{ question: '', answer: '' }]);
  const [themeZones, setThemeZones] = useState({});
  const [uploadingZone, setUploadingZone] = useState(null);
  const [uploadingBadge, setUploadingBadge] = useState(false);
  const [uploadingPageBg, setUploadingPageBg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [mailForm, setMailForm] = useState(EMPTY_MAIL_FORM);
  const [mailPassSet, setMailPassSet] = useState(false);
  const [mailLoading, setMailLoading] = useState(true);
  const [mailSubmitting, setMailSubmitting] = useState(false);
  const [mailError, setMailError] = useState('');
  const [mailSuccess, setMailSuccess] = useState(false);

  const [oauthForm, setOAuthForm] = useState(EMPTY_OAUTH_FORM);
  const [facebookSecretSet, setFacebookSecretSet] = useState(false);
  const [oauthLoading, setOAuthLoading] = useState(true);
  const [oauthSubmitting, setOAuthSubmitting] = useState(false);
  const [oauthError, setOAuthError] = useState('');
  const [oauthSuccess, setOAuthSuccess] = useState(false);

  // Banner danh mục trang chủ - danh sách cuối cùng chỉ dựng được sau khi CẢ
  // categories (từ useCategories) lẫn rawCategoryBanners (từ getSettings) đều
  // đã tải xong, vì mỗi danh mục cần đúng 1 dòng kể cả khi chưa có banner nào.
  const [rawCategoryBanners, setRawCategoryBanners] = useState(null);
  const [categoryBanners, setCategoryBanners] = useState([]);
  const [uploadingBannerSlug, setUploadingBannerSlug] = useState(null);
  const [bannerBrands, setBannerBrands] = useState([]);

  // 2 banner phụ cạnh slider chính trang chủ - luôn hiển thị đúng 2 dòng
  // (khác categoryBanners không cố định số dòng theo danh mục).
  const [heroSideBanners, setHeroSideBanners] = useState([emptyHeroBanner(), emptyHeroBanner()]);
  const [uploadingHeroSlot, setUploadingHeroSlot] = useState(null);

  useEffect(() => {
    getBrands('all', '', '').then(setBannerBrands);
  }, []);

  useEffect(() => {
    if (!categories.length || rawCategoryBanners === null) return;
    setCategoryBanners(
      categories.map((c) => rawCategoryBanners.find((b) => b.categorySlug === c.slug) || emptyBanner(c.slug))
    );
  }, [categories, rawCategoryBanners]);

  useEffect(() => {
    getMailSettings().then((s) => {
      setMailForm({
        smtpHost: s.smtpHost || '',
        smtpPort: s.smtpPort || '',
        smtpSecure: s.smtpSecure || false,
        smtpUser: s.smtpUser || '',
        smtpPass: '',
        mailFrom: s.mailFrom || '',
      });
      setMailPassSet(s.smtpPassSet);
      setMailLoading(false);
    });
  }, []);

  useEffect(() => {
    getOAuthSettings().then((s) => {
      setOAuthForm({
        googleClientId: s.googleClientId || '',
        facebookAppId: s.facebookAppId || '',
        facebookAppSecret: '',
      });
      setFacebookSecretSet(s.facebookAppSecretSet);
      setOAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    getSettings().then((s) => {
      setForm({
        hotline: s.hotline || '',
        chatbotPhone: s.chatbotPhone || '',
        email: s.email || '',
        address: s.address || '',
        companyName: s.companyName || '',
        companyTaxCode: s.companyTaxCode || '',
        workingHours: s.workingHours || '',
        facebookUrl: s.facebookUrl || '',
        zaloUrl: s.zaloUrl || '',
        youtubeUrl: s.youtubeUrl || '',
        tiktokUrl: s.tiktokUrl || '',
        instagramUrl: s.instagramUrl || '',
        aboutText: s.aboutText || '',
        complianceBadgeImage: s.complianceBadgeImage || '',
        complianceBadgeUrl: s.complianceBadgeUrl || '',
        pageBackgroundImage: s.pageBackgroundImage || '',
      });
      const loadedCoreFeatures = CORE_FEATURE_META.map((_, i) => s.coreFeatures?.[i] || { title: '', description: '' });
      setCoreFeatures(loadedCoreFeatures);
      setBuyingGuideSteps(s.buyingGuideSteps?.length ? s.buyingGuideSteps : [{ title: '', description: '' }]);
      setFaqItems(s.faqItems?.length ? s.faqItems : [{ question: '', answer: '' }]);
      setThemeZones(s.themeZones || {});
      setRawCategoryBanners(s.categoryBanners || []);
      const loadedHeroBanners = s.heroSideBanners || [];
      setHeroSideBanners([0, 1].map((i) => loadedHeroBanners[i] || emptyHeroBanner()));
      setLoading(false);
    });
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function updateCoreFeatureRow(index, field, value) {
    setCoreFeatures((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function updateStepRow(index, field, value) {
    setBuyingGuideSteps((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addStepRow() {
    setBuyingGuideSteps((prev) => [...prev, { title: '', description: '' }]);
  }

  function removeStepRow(index) {
    setBuyingGuideSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFaqRow(index, field, value) {
    setFaqItems((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function addFaqRow() {
    setFaqItems((prev) => [...prev, { question: '', answer: '' }]);
  }

  function removeFaqRow(index) {
    setFaqItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateThemeZone(zoneId, field, value) {
    setThemeZones((prev) => ({
      ...prev,
      [zoneId]: { bg: null, image: null, ...prev[zoneId], [field]: value },
    }));
  }

  function resetThemeZone(zoneId) {
    setThemeZones((prev) => ({ ...prev, [zoneId]: { bg: null, image: null } }));
  }

  async function handleThemeImageUpload(zoneId, file) {
    setUploadingZone(zoneId);
    try {
      const { url } = await uploadThemeImage(file);
      updateThemeZone(zoneId, 'image', url);
    } catch {
      setError('Tải ảnh lên thất bại, vui lòng thử lại.');
    } finally {
      setUploadingZone(null);
    }
  }

  function updateBannerField(slug, field, value) {
    setCategoryBanners((prev) => prev.map((b) => (b.categorySlug === slug ? { ...b, [field]: value } : b)));
  }

  async function handleBannerImageUpload(slug, file) {
    setUploadingBannerSlug(slug);
    try {
      const { url } = await uploadThemeImage(file);
      updateBannerField(slug, 'image', url);
    } catch {
      setError('Tải ảnh lên thất bại, vui lòng thử lại.');
    } finally {
      setUploadingBannerSlug(null);
    }
  }

  function updateHeroBannerField(index, field, value) {
    setHeroSideBanners((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  }

  async function handleHeroBannerImageUpload(index, file) {
    setUploadingHeroSlot(index);
    try {
      const { url } = await uploadThemeImage(file);
      updateHeroBannerField(index, 'image', url);
    } catch {
      setError('Tải ảnh lên thất bại, vui lòng thử lại.');
    } finally {
      setUploadingHeroSlot(null);
    }
  }

  async function handleBadgeImageUpload(file) {
    setUploadingBadge(true);
    try {
      const { url } = await uploadThemeImage(file);
      setForm((prev) => ({ ...prev, complianceBadgeImage: url }));
    } catch {
      setError('Tải ảnh lên thất bại, vui lòng thử lại.');
    } finally {
      setUploadingBadge(false);
    }
  }

  async function handlePageBgUpload(file) {
    setUploadingPageBg(true);
    try {
      const { url } = await uploadThemeImage(file);
      setForm((prev) => ({ ...prev, pageBackgroundImage: url }));
    } catch {
      setError('Tải ảnh lên thất bại, vui lòng thử lại.');
    } finally {
      setUploadingPageBg(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      await updateSettings({
        ...form,
        facebookUrl: form.facebookUrl || null,
        zaloUrl: form.zaloUrl || null,
        youtubeUrl: form.youtubeUrl || null,
        tiktokUrl: form.tiktokUrl || null,
        instagramUrl: form.instagramUrl || null,
        coreFeatures,
        buyingGuideSteps: buyingGuideSteps.filter((row) => row.title.trim() && row.description.trim()),
        faqItems: faqItems.filter((row) => row.question.trim() && row.answer.trim()),
        themeZones,
        categoryBanners,
        heroSideBanners,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleMailChange(field) {
    return (e) => {
      const value = field === 'smtpSecure' ? e.target.checked : e.target.value;
      setMailForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function handleMailSubmit(e) {
    e.preventDefault();
    setMailSubmitting(true);
    setMailError('');
    setMailSuccess(false);
    try {
      const result = await updateMailSettings(mailForm);
      // Không giữ lại mật khẩu vừa gõ trong state - GET sau này cũng sẽ
      // không bao giờ trả về giá trị thật, ô này luôn trống khi mở lại form.
      setMailForm((prev) => ({ ...prev, smtpPass: '' }));
      setMailPassSet(result.smtpPassSet);
      setMailSuccess(true);
    } catch (err) {
      setMailError(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setMailSubmitting(false);
    }
  }

  function handleOAuthChange(field) {
    return (e) => setOAuthForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleOAuthSubmit(e) {
    e.preventDefault();
    setOAuthSubmitting(true);
    setOAuthError('');
    setOAuthSuccess(false);
    try {
      const result = await updateOAuthSettings(oauthForm);
      // Không giữ lại App Secret vừa gõ trong state - GET sau này cũng sẽ
      // không bao giờ trả về giá trị thật, ô này luôn trống khi mở lại form.
      setOAuthForm((prev) => ({ ...prev, facebookAppSecret: '' }));
      setFacebookSecretSet(result.facebookAppSecretSet);
      setOAuthSuccess(true);
    } catch (err) {
      setOAuthError(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setOAuthSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold m-0">Cài đặt trang web</h3>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            <i className="bi bi-check-circle-fill"></i> Đã lưu cài đặt. Thay đổi sẽ áp dụng ngay trên toàn trang.
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="bg-white p-4 rounded-3 border mb-4">
              <h6 className="fw-bold mb-3">Thông tin liên hệ</h6>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Hotline *</label>
                  <input className="form-control" value={form.hotline} onChange={handleChange('hotline')} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Email *</label>
                  <input type="email" className="form-control" value={form.email} onChange={handleChange('email')} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Số điện thoại chatbot (tùy chọn)</label>
                <input
                  className="form-control"
                  value={form.chatbotPhone}
                  onChange={handleChange('chatbotPhone')}
                  placeholder="Để trống thì chatbot dùng chung số Hotline ở trên"
                />
                <p className="text-muted small mb-0 mt-1">
                  Số điện thoại chatbot đọc ra khi tư vấn khách - để trống nếu muốn dùng chung với Hotline,
                  hoặc điền riêng nếu muốn chatbot báo số khác (vd đường dây tư vấn nhanh riêng).
                </p>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Địa chỉ *</label>
                <input className="form-control" value={form.address} onChange={handleChange('address')} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Giờ làm việc *</label>
                <input className="form-control" value={form.workingHours} onChange={handleChange('workingHours')} required />
              </div>
            </div>

            <div className="bg-white p-4 rounded-3 border mb-4">
              <h6 className="fw-bold mb-3">Thông tin công ty</h6>
              <div className="mb-3">
                <label className="form-label small fw-bold">Tên công ty *</label>
                <input className="form-control" value={form.companyName} onChange={handleChange('companyName')} required />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Mã số doanh nghiệp *</label>
                <input className="form-control" value={form.companyTaxCode} onChange={handleChange('companyTaxCode')} required />
              </div>
            </div>

            <div className="bg-white p-4 rounded-3 border mb-4">
              <h6 className="fw-bold mb-3">Cấu hình gửi email (SMTP)</h6>
              <p className="text-muted small mb-3">
                Dùng để gửi email chào mừng và email đặt lại mật khẩu cho khách hàng. Điền thông
                tin SMTP từ nơi bạn quản lý email cho tên miền dienmaynk.vn (Google Workspace,
                Zoho Mail, hoặc dịch vụ gửi email như Brevo/Amazon SES...). Lưu ở đây là áp dụng
                ngay, không cần deploy lại. Chưa điền thì hệ thống chỉ ghi log ở server, chưa gửi
                được email thật.
              </p>
              {mailLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-warning" role="status"></div>
                </div>
              ) : (
                // Không dùng thẻ <form> lồng bên trong <form> chính của cả trang (HTML
                // không cho phép form lồng nhau) - nút bên dưới là type="button" với
                // onClick riêng thay vì submit, để lưu độc lập không đụng form ngoài.
                <div>
                  {mailError && <div className="alert alert-danger py-2 small">{mailError}</div>}
                  {mailSuccess && (
                    <div className="alert alert-success py-2 small">
                      <i className="bi bi-check-circle-fill"></i> Đã lưu cấu hình email.
                    </div>
                  )}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">SMTP Host</label>
                      <input className="form-control" value={mailForm.smtpHost} onChange={handleMailChange('smtpHost')} placeholder="smtp.zoho.com" />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">Cổng (Port)</label>
                      <input type="number" className="form-control" value={mailForm.smtpPort} onChange={handleMailChange('smtpPort')} placeholder="587" />
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="smtpSecure"
                          checked={mailForm.smtpSecure}
                          onChange={handleMailChange('smtpSecure')}
                        />
                        <label className="form-check-label small" htmlFor="smtpSecure">Dùng SSL (cổng 465)</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Tên đăng nhập SMTP</label>
                      <input className="form-control" value={mailForm.smtpUser} onChange={handleMailChange('smtpUser')} placeholder="noreply@dienmaynk.vn" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Mật khẩu SMTP</label>
                      <input
                        type="password"
                        className="form-control"
                        value={mailForm.smtpPass}
                        onChange={handleMailChange('smtpPass')}
                        placeholder={mailPassSet ? 'Đã lưu - để trống nếu giữ nguyên' : 'Chưa lưu mật khẩu nào'}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">Tên người gửi hiển thị</label>
                      <input
                        className="form-control"
                        value={mailForm.mailFrom}
                        onChange={handleMailChange('mailFrom')}
                        placeholder="Điện Máy NK <no-reply@dienmaynk.vn>"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-dark fw-bold rounded-pill px-4"
                    onClick={handleMailSubmit}
                    disabled={mailSubmitting}
                  >
                    {mailSubmitting ? 'Đang lưu...' : 'Lưu cấu hình email'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-3 border mb-4">
              <h6 className="fw-bold mb-3">Đăng nhập Google &amp; Facebook</h6>
              <p className="text-muted small mb-3">
                Cho phép khách hàng đăng nhập/đăng ký bằng tài khoản Google hoặc Facebook. Lấy Client
                ID/App ID/App Secret từ Google Cloud Console và Meta for Developers, dán vào đây - áp
                dụng ngay, không cần build lại. Chưa điền thì nút đăng nhập tương ứng tự ẩn/báo chưa
                cấu hình, không lỗi.
              </p>
              {oauthLoading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-warning" role="status"></div>
                </div>
              ) : (
                // Không dùng thẻ <form> lồng bên trong <form> chính của cả trang, giống
                // khối SMTP ở trên - nút lưu là type="button" với onClick riêng.
                <div>
                  {oauthError && <div className="alert alert-danger py-2 small">{oauthError}</div>}
                  {oauthSuccess && (
                    <div className="alert alert-success py-2 small">
                      <i className="bi bi-check-circle-fill"></i> Đã lưu cấu hình đăng nhập Google &amp; Facebook.
                    </div>
                  )}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Google Client ID</label>
                      <input
                        className="form-control"
                        value={oauthForm.googleClientId}
                        onChange={handleOAuthChange('googleClientId')}
                        placeholder="xxxxx.apps.googleusercontent.com"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Facebook App ID</label>
                      <input
                        className="form-control"
                        value={oauthForm.facebookAppId}
                        onChange={handleOAuthChange('facebookAppId')}
                        placeholder="vd: 1234567890123456"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Facebook App Secret</label>
                      <input
                        type="password"
                        className="form-control"
                        value={oauthForm.facebookAppSecret}
                        onChange={handleOAuthChange('facebookAppSecret')}
                        placeholder={facebookSecretSet ? 'Đã lưu - để trống nếu giữ nguyên' : 'Chưa lưu App Secret nào'}
                        autoComplete="new-password"
                      />
                      <p className="text-muted small mb-0 mt-1">
                        Chỉ dùng ở server, không bao giờ hiển thị lại sau khi lưu.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-dark fw-bold rounded-pill px-4"
                    onClick={handleOAuthSubmit}
                    disabled={oauthSubmitting}
                  >
                    {oauthSubmitting ? 'Đang lưu...' : 'Lưu cấu hình đăng nhập'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-3 border mb-4">
              <h6 className="fw-bold mb-3">Icon "Đã thông báo Bộ Công Thương" (footer)</h6>
              <p className="text-muted small mb-3">
                Chưa upload ảnh thì footer tự hiện dòng "Chưa thông báo Bộ Công Thương" trung thực -
                không hiện icon xác nhận giả khi site chưa thật sự đăng ký. Khi có xác nhận thật từ
                cơ quan chức năng (vd online.gov.vn), upload đúng icon được cấp và dán link xác nhận vào đây.
              </p>
              <div className="row g-3 align-items-end">
                <div className="col-auto">
                  <label className="form-label small fw-bold">Icon</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control form-control-sm"
                    disabled={uploadingBadge}
                    onChange={(e) => e.target.files[0] && handleBadgeImageUpload(e.target.files[0])}
                  />
                </div>
                {uploadingBadge && (
                  <div className="col-auto">
                    <span className="spinner-border spinner-border-sm text-warning"></span>
                  </div>
                )}
                {form.complianceBadgeImage && (
                  <>
                    <div className="col-auto">
                      <img
                        src={resolveImageUrl(form.complianceBadgeImage)}
                        alt=""
                        style={{ height: 40, objectFit: 'contain', borderRadius: 4 }}
                      />
                    </div>
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setForm((prev) => ({ ...prev, complianceBadgeImage: '' }))}
                      >
                        Xoá, dùng placeholder mặc định
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="mt-3">
                <label className="form-label small fw-bold">Link xác nhận (tùy chọn)</label>
                <input
                  className="form-control"
                  value={form.complianceBadgeUrl}
                  onChange={handleChange('complianceBadgeUrl')}
                  placeholder="https://online.gov.vn/..."
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-3 border mb-4">
              <h6 className="fw-bold mb-3">Mạng xã hội</h6>
              <p className="text-muted small mb-3">Để trống nếu chưa có, icon tương ứng ở footer sẽ không dẫn tới đâu cả.</p>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Facebook</label>
                  <input className="form-control" value={form.facebookUrl} onChange={handleChange('facebookUrl')} placeholder="https://facebook.com/..." />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Zalo</label>
                  <input className="form-control" value={form.zaloUrl} onChange={handleChange('zaloUrl')} placeholder="https://zalo.me/..." />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Youtube</label>
                  <input className="form-control" value={form.youtubeUrl} onChange={handleChange('youtubeUrl')} placeholder="https://youtube.com/..." />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">TikTok</label>
                  <input className="form-control" value={form.tiktokUrl} onChange={handleChange('tiktokUrl')} placeholder="https://tiktok.com/@..." />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Instagram</label>
                  <input className="form-control" value={form.instagramUrl} onChange={handleChange('instagramUrl')} placeholder="https://instagram.com/..." />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-3 border mb-4">
              <h6 className="fw-bold mb-3">Cam kết dịch vụ (trang chủ)</h6>
              <p className="text-muted small mb-3">4 mục hiển thị ngay dưới banner đầu trang chủ. Icon/màu cố định, chỉ sửa được tiêu đề và mô tả.</p>
              {coreFeatures.map((row, i) => (
                <div className="row g-2 mb-2 align-items-center" key={i}>
                  <div className="col-auto">
                    <span className={`d-inline-flex align-items-center justify-content-center rounded-circle ${CORE_FEATURE_META[i].colorClass}`} style={{ width: 40, height: 40 }}>
                      <i className={`bi ${CORE_FEATURE_META[i].icon}`}></i>
                    </span>
                  </div>
                  <div className="col-4">
                    <input
                      className="form-control form-control-sm"
                      placeholder="Tiêu đề"
                      value={row.title}
                      onChange={(e) => updateCoreFeatureRow(i, 'title', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col">
                    <input
                      className="form-control form-control-sm"
                      placeholder="Mô tả"
                      value={row.description}
                      onChange={(e) => updateCoreFeatureRow(i, 'description', e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-3 border mb-4">
              <h6 className="fw-bold mb-3">Giới thiệu</h6>
              <p className="text-muted small mb-3">Nội dung đoạn "Điện Máy NK là ai?" ở trang Giới thiệu. Mỗi dòng là một đoạn văn riêng.</p>
              <textarea className="form-control" rows={6} value={form.aboutText} onChange={handleChange('aboutText')} required />
            </div>

            <div className="bg-white p-4 rounded-3 border mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold m-0">Hướng dẫn mua hàng (các bước)</h6>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={addStepRow}>
                  <i className="bi bi-plus"></i> Thêm bước
                </button>
              </div>
              {buyingGuideSteps.map((row, i) => (
                <div className="row g-2 mb-2 align-items-start" key={i}>
                  <div className="col-3">
                    <input
                      className="form-control form-control-sm"
                      placeholder="Tiêu đề bước"
                      value={row.title}
                      onChange={(e) => updateStepRow(i, 'title', e.target.value)}
                    />
                  </div>
                  <div className="col-8">
                    <textarea
                      className="form-control form-control-sm"
                      rows={2}
                      placeholder="Mô tả"
                      value={row.description}
                      onChange={(e) => updateStepRow(i, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-1">
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeStepRow(i)}>
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-3 border mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold m-0">Câu hỏi thường gặp</h6>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={addFaqRow}>
                  <i className="bi bi-plus"></i> Thêm câu hỏi
                </button>
              </div>
              {faqItems.map((row, i) => (
                <div className="row g-2 mb-2 align-items-start" key={i}>
                  <div className="col-3">
                    <input
                      className="form-control form-control-sm"
                      placeholder="Câu hỏi"
                      value={row.question}
                      onChange={(e) => updateFaqRow(i, 'question', e.target.value)}
                    />
                  </div>
                  <div className="col-8">
                    <textarea
                      className="form-control form-control-sm"
                      rows={2}
                      placeholder="Câu trả lời"
                      value={row.answer}
                      onChange={(e) => updateFaqRow(i, 'answer', e.target.value)}
                    />
                  </div>
                  <div className="col-1">
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeFaqRow(i)}>
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-3 border mb-4">
              <h6 className="fw-bold mb-3">Banner phụ trang chủ (cạnh slider chính)</h6>
              <p className="text-muted small mb-3">
                2 banner nhỏ hiển thị bên phải slider chính ở đầu trang chủ. Banner nào chưa upload
                ảnh sẽ tự ẩn - nếu cả 2 đều trống, slider chính chiếm trọn chiều rộng. <strong>Khuyến
                nghị ảnh tỉ lệ ngang khoảng 1:1 đến 4:3</strong> (vd 600×500px trở lên), hệ thống tự
                nén WebP và cắt vừa khung.
              </p>
              {heroSideBanners.map((banner, index) => (
                <div className="border rounded-3 p-3 mb-3" key={index}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold m-0">Banner phụ {index + 1}</h6>
                    {banner.image && <span className="badge bg-success-subtle text-success">Đang hiển thị</span>}
                  </div>
                  <div className="row g-3 align-items-end">
                    <div className="col-auto">
                      <label className="form-label small fw-bold">Ảnh banner</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control form-control-sm"
                        disabled={uploadingHeroSlot === index}
                        onChange={(e) => e.target.files[0] && handleHeroBannerImageUpload(index, e.target.files[0])}
                      />
                    </div>
                    {uploadingHeroSlot === index && (
                      <div className="col-auto">
                        <span className="spinner-border spinner-border-sm text-warning"></span>
                      </div>
                    )}
                    {banner.image && (
                      <>
                        <div className="col-auto">
                          <img
                            src={resolveImageUrl(banner.image)}
                            alt=""
                            style={{ height: 60, objectFit: 'cover', borderRadius: 4 }}
                          />
                        </div>
                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateHeroBannerField(index, 'image', '')}
                          >
                            Xoá banner
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="row g-3 mt-1">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Chữ hiển thị đè trên ảnh (tùy chọn)</label>
                      <input
                        className="form-control form-control-sm"
                        value={banner.title}
                        onChange={(e) => updateHeroBannerField(index, 'title', e.target.value)}
                        placeholder="vd: Chuẩn gu sành vang"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Bấm vào dẫn tới</label>
                      <select
                        className="form-select form-select-sm"
                        value={banner.linkType}
                        onChange={(e) => updateHeroBannerField(index, 'linkType', e.target.value)}
                      >
                        {Object.entries(BANNER_LINK_TYPE_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">
                        {banner.linkType === 'category' ? 'Chọn danh mục' : banner.linkType === 'brand' ? 'Chọn nhãn hiệu' : 'Link sản phẩm'}
                      </label>
                      {banner.linkType === 'category' && (
                        <select
                          className="form-select form-select-sm"
                          value={banner.linkValue}
                          onChange={(e) => updateHeroBannerField(index, 'linkValue', e.target.value)}
                        >
                          <option value="">-- Chọn danh mục --</option>
                          {categories.map((c) => (
                            <option key={c.slug} value={c.slug}>{c.name}</option>
                          ))}
                        </select>
                      )}
                      {banner.linkType === 'brand' && (
                        <select
                          className="form-select form-select-sm"
                          value={banner.linkValue}
                          onChange={(e) => updateHeroBannerField(index, 'linkValue', e.target.value)}
                        >
                          <option value="">-- Chọn nhãn hiệu --</option>
                          {bannerBrands.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      )}
                      {banner.linkType === 'product' && (
                        <input
                          className="form-control form-control-sm"
                          value={banner.linkValue}
                          onChange={(e) => updateHeroBannerField(index, 'linkValue', e.target.value)}
                          placeholder="/san-pham/ten-san-pham-1234"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-3 border mb-4">
              <h6 className="fw-bold mb-3">Banner danh mục (trang chủ)</h6>
              <p className="text-muted small mb-3">
                Banner dọc hiển thị cạnh mỗi danh mục ở trang chủ. Danh mục nào chưa upload ảnh thì
                hiển thị bình thường, không có banner. <strong>Khuyến nghị ảnh vuông (tỉ lệ 1:1), tối
                thiểu 500×500px</strong>, nền trắng hoặc trong suốt để nổi bật trên nền màu của banner -
                hệ thống tự nén sang WebP và tự co giãn đẹp trên mọi thiết bị (máy tính, máy tính
                bảng, điện thoại).
              </p>
              {categoryBanners.length === 0 ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-warning" role="status"></div>
                </div>
              ) : (
                categoryBanners.map((banner) => {
                  const category = categories.find((c) => c.slug === banner.categorySlug);
                  return (
                    <div className="border rounded-3 p-3 mb-3" key={banner.categorySlug}>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold m-0">{category?.name || banner.categorySlug}</h6>
                        {banner.image && <span className="badge bg-success-subtle text-success">Đang hiển thị</span>}
                      </div>

                      <div className="row g-3 align-items-end">
                        <div className="col-auto">
                          <label className="form-label small fw-bold">Ảnh banner</label>
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control form-control-sm"
                            disabled={uploadingBannerSlug === banner.categorySlug}
                            onChange={(e) => e.target.files[0] && handleBannerImageUpload(banner.categorySlug, e.target.files[0])}
                          />
                        </div>
                        {uploadingBannerSlug === banner.categorySlug && (
                          <div className="col-auto">
                            <span className="spinner-border spinner-border-sm text-warning"></span>
                          </div>
                        )}
                        {banner.image && (
                          <>
                            <div className="col-auto">
                              <img
                                src={resolveImageUrl(banner.image)}
                                alt=""
                                style={{ height: 60, objectFit: 'contain', borderRadius: 4, background: '#f4f4f4', padding: 4 }}
                              />
                            </div>
                            <div className="col-auto">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateBannerField(banner.categorySlug, 'image', '')}
                              >
                                Xoá banner
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="row g-3 mt-1">
                        <div className="col-md-4">
                          <label className="form-label small fw-bold">Nhãn nhỏ (eyebrow)</label>
                          <input
                            className="form-control form-control-sm"
                            value={banner.eyebrow}
                            onChange={(e) => updateBannerField(banner.categorySlug, 'eyebrow', e.target.value)}
                            placeholder="vd: Điện Tử"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small fw-bold">Tiêu đề</label>
                          <input
                            className="form-control form-control-sm"
                            value={banner.title}
                            onChange={(e) => updateBannerField(banner.categorySlug, 'title', e.target.value)}
                            placeholder="vd: Loa Karaoke Arirang"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small fw-bold">Giá hiển thị (tùy chọn)</label>
                          <input
                            className="form-control form-control-sm"
                            value={banner.priceLabel}
                            onChange={(e) => updateBannerField(banner.categorySlug, 'priceLabel', e.target.value)}
                            placeholder="vd: Chỉ từ 9,29 Triệu"
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-bold">Mô tả ngắn (tùy chọn)</label>
                          <input
                            className="form-control form-control-sm"
                            value={banner.perk}
                            onChange={(e) => updateBannerField(banner.categorySlug, 'perk', e.target.value)}
                            placeholder="vd: Trả góp 0% · Bảo hành 12 tháng"
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">Màu nền</label>
                          <select
                            className="form-select form-select-sm"
                            value={banner.theme}
                            onChange={(e) => updateBannerField(banner.categorySlug, 'theme', e.target.value)}
                          >
                            {Object.entries(BANNER_THEME_LABEL).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">Vị trí</label>
                          <select
                            className="form-select form-select-sm"
                            value={banner.side}
                            onChange={(e) => updateBannerField(banner.categorySlug, 'side', e.target.value)}
                          >
                            {Object.entries(BANNER_SIDE_LABEL).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">Bấm vào dẫn tới</label>
                          <select
                            className="form-select form-select-sm"
                            value={banner.linkType}
                            onChange={(e) => updateBannerField(banner.categorySlug, 'linkType', e.target.value)}
                          >
                            {Object.entries(BANNER_LINK_TYPE_LABEL).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold">
                            {banner.linkType === 'category' ? 'Chọn danh mục' : banner.linkType === 'brand' ? 'Chọn nhãn hiệu' : 'Link sản phẩm'}
                          </label>
                          {banner.linkType === 'category' && (
                            <select
                              className="form-select form-select-sm"
                              value={banner.linkValue}
                              onChange={(e) => updateBannerField(banner.categorySlug, 'linkValue', e.target.value)}
                            >
                              {categories.map((c) => (
                                <option key={c.slug} value={c.slug}>{c.name}</option>
                              ))}
                            </select>
                          )}
                          {banner.linkType === 'brand' && (
                            <select
                              className="form-select form-select-sm"
                              value={banner.linkValue}
                              onChange={(e) => updateBannerField(banner.categorySlug, 'linkValue', e.target.value)}
                            >
                              <option value="">-- Chọn nhãn hiệu --</option>
                              {bannerBrands.map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          )}
                          {banner.linkType === 'product' && (
                            <input
                              className="form-control form-control-sm"
                              value={banner.linkValue}
                              onChange={(e) => updateBannerField(banner.categorySlug, 'linkValue', e.target.value)}
                              placeholder="/san-pham/ten-san-pham-1234"
                            />
                          )}
                        </div>
                      </div>
                      {banner.linkType === 'product' && (
                        <p className="text-muted small mb-0 mt-2">
                          Mở trang sản phẩm muốn gắn vào banner này trên trang thật, sao chép đường dẫn
                          từ thanh địa chỉ trình duyệt (phần sau tên miền, vd: /san-pham/ten-san-pham-1234)
                          rồi dán vào đây.
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="bg-white p-4 rounded-3 border mb-4">
              <h6 className="fw-bold mb-3">Giao diện trang web</h6>
              <p className="text-muted small mb-3">
                Đổi màu/ảnh nền riêng cho từng khu vực - để trống thì dùng màu mặc định của giao
                diện hiện tại. 2 mục "hàng chẵn/hàng lẻ" áp dụng cho tất cả section danh mục xen
                kẽ trên trang chủ, chưa hỗ trợ chỉnh riêng từng danh mục. Ảnh nền phù hợp để đổi
                theo mùa/sự kiện (Tết, khuyến mãi lớn...).
              </p>
              {THEME_ZONE_GROUPS.map((group) => (
                <div className="mb-4" key={group.label}>
                  <h6 className="small fw-bold text-muted text-uppercase mb-2">{group.label}</h6>
                  {group.zones.map((zone) => {
                    const z = themeZones[zone.id] || { bg: null, image: null };
                    const isDefault = !z.bg && !z.image;
                    return (
                      <div className="row g-2 mb-2 align-items-center" key={zone.id}>
                        <div className="col-md-4 small">{zone.label}</div>
                        <div className="col-auto">
                          <input
                            type="color"
                            className="form-control form-control-color"
                            title="Màu nền"
                            value={z.bg || '#ffffff'}
                            onChange={(e) => updateThemeZone(zone.id, 'bg', e.target.value)}
                          />
                        </div>
                        <div className="col-auto">
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control form-control-sm"
                            disabled={uploadingZone === zone.id}
                            onChange={(e) => e.target.files[0] && handleThemeImageUpload(zone.id, e.target.files[0])}
                          />
                        </div>
                        {uploadingZone === zone.id && (
                          <div className="col-auto">
                            <span className="spinner-border spinner-border-sm text-warning"></span>
                          </div>
                        )}
                        {z.image && (
                          <div className="col-auto">
                            <img
                              src={resolveImageUrl(z.image)}
                              alt=""
                              style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4 }}
                            />
                          </div>
                        )}
                        <div className="col-auto">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            disabled={isDefault}
                            onClick={() => resetThemeZone(zone.id)}
                          >
                            Mặc định
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-3 border mb-4">
              <h6 className="fw-bold mb-3">Ảnh nền toàn trang (tất cả các trang)</h6>
              <p className="text-muted small mb-3">
                Ảnh trang trí phía sau nội dung, áp dụng cho mọi trang (trang chủ, danh mục, sản
                phẩm, tin tức...) - không riêng trang chủ. Chưa upload thì hệ thống tự dùng nền
                gradient vàng hổ phách theo màu thương hiệu hiện tại.
              </p>
              <p className="text-muted small mb-3">
                <strong>Kích cỡ khuyến nghị:</strong> tối thiểu 1920×1080px (khổ ngang, tỉ lệ 16:9),
                định dạng JPG/PNG/WebP, dung lượng dưới 2MB để tải nhanh. Ảnh sẽ tự cắt phủ kín
                chiều rộng màn hình (giữ đúng tỉ lệ) và neo ở mép trên - nội dung quan trọng nên đặt
                giữa ảnh vì phần rìa trái/phải có thể bị cắt trên màn hình rộng hoặc hẹp khác nhau.
                Tông màu nên nhạt/trung tính để chữ và sản phẩm trên nền trắng của các khối nội dung
                vẫn rõ, dễ đọc.
              </p>
              <div className="row g-3 align-items-end">
                <div className="col-auto">
                  <label className="form-label small fw-bold">Ảnh nền</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control form-control-sm"
                    disabled={uploadingPageBg}
                    onChange={(e) => e.target.files[0] && handlePageBgUpload(e.target.files[0])}
                  />
                </div>
                {uploadingPageBg && (
                  <div className="col-auto">
                    <span className="spinner-border spinner-border-sm text-warning"></span>
                  </div>
                )}
                {form.pageBackgroundImage && (
                  <>
                    <div className="col-auto">
                      <img
                        src={resolveImageUrl(form.pageBackgroundImage)}
                        alt=""
                        style={{ width: 120, height: 68, objectFit: 'cover', borderRadius: 4 }}
                      />
                    </div>
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setForm((prev) => ({ ...prev, pageBackgroundImage: '' }))}
                      >
                        Xoá, dùng nền mặc định
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-warning w-100 fw-bold rounded-pill py-2" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminSettings;
