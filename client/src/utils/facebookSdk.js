let loadPromise = null;

// Facebook JS SDK không có gói npm chính thức - phải nạp qua script tag toàn
// cục (window.FB) theo đúng cách Meta yêu cầu. Chỉ nạp một lần dù gọi nhiều
// lần (vd người dùng mở lại AuthModal).
function loadFacebookSdk(appId) {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (window.FB) {
      resolve(window.FB);
      return;
    }
    window.fbAsyncInit = function fbAsyncInit() {
      window.FB.init({ appId, cookie: true, xfbml: false, version: 'v21.0' });
      resolve(window.FB);
    };
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/vi_VN/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Không tải được Facebook SDK'));
    document.body.appendChild(script);
  });

  return loadPromise;
}

// Trả về access token nếu đăng nhập/cấp quyền email thành công, hoặc throw
// nếu người dùng hủy/từ chối. `appId` lấy từ settings.facebookAppId
// (Admin > Cài đặt, áp dụng ngay) chứ không đọc thẳng biến môi trường Vite
// nữa - đổi giá trị không cần build lại.
export async function loginWithFacebookSdk(appId) {
  if (!appId) throw new Error('Chưa cấu hình đăng nhập Facebook');

  const FB = await loadFacebookSdk(appId);
  const response = await new Promise((resolve) => FB.login(resolve, { scope: 'email' }));

  if (response.status !== 'connected') {
    throw new Error('Bạn đã hủy đăng nhập Facebook');
  }
  return response.authResponse.accessToken;
}
