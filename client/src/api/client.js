import axios from 'axios';

// Không có VITE_API_URL (dev local) thì tự lấy theo host đang mở trang web -
// vào bằng localhost thì gọi API ở localhost, vào bằng IP LAN (vd từ điện
// thoại thật cùng mạng) thì tự gọi đúng IP đó, không cần sửa .env mỗi khi
// đổi mạng/IP.
export const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:4000`;

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

apiClient.interceptors.request.use((config) => {
  const isAdminRequest = config.url?.startsWith('/admin') || config.url?.startsWith('/auth');
  const token = localStorage.getItem(isAdminRequest ? 'dmnk_admin_token' : 'dmnk_customer_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
