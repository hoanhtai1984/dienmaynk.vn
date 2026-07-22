let loadPromise = null;

// Google Identity Services - nạp qua script tag toàn cục (window.google),
// giống cách nạp Facebook SDK, thay vì dùng thư viện React wrapper (đã gỡ vì
// không tương thích với React 19, gây lỗi "Invalid hook call" toàn trang).
function loadGoogleSdk() {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Không tải được Google Sign-In SDK'));
    document.body.appendChild(script);
  });

  return loadPromise;
}

// Vẽ nút "Đăng nhập bằng Google" chính thức của Google vào `container` (DOM
// node) - đây là API mệnh lệnh (imperative) của Google, tự vẽ iframe vào bên
// trong, không phải component React. `onCredential` nhận ID token (JWT) mỗi
// khi người dùng đăng nhập thành công. `clientId` lấy từ settings.googleClientId
// (Admin > Cài đặt, áp dụng ngay) chứ không đọc thẳng biến môi trường Vite
// nữa - đổi giá trị không cần build lại.
export async function renderGoogleButton(container, onCredential, clientId) {
  if (!container || !clientId) return;

  const google = await loadGoogleSdk();
  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => onCredential(response.credential),
  });
  container.innerHTML = '';
  google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: 320, locale: 'vi' });
}

export function isGoogleLoginConfigured(clientId) {
  return !!clientId;
}
