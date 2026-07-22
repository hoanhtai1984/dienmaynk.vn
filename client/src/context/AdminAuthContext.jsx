import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, getMe, logout as apiLogout, changePassword as apiChangePassword } from '../api/admin';

const TOKEN_KEY = 'dmnk_admin_token';
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setAdmin)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { token, admin: adminData } = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    setAdmin(adminData);
  }

  // Đổi mật khẩu chính mình - server trả token MỚI (tokenVersion đã tăng) để
  // phiên hiện tại tiếp tục dùng được ngay, không bị đăng xuất giữa chừng.
  async function changePassword(currentPassword, newPassword) {
    const { token } = await apiChangePassword(currentPassword, newPassword);
    localStorage.setItem(TOKEN_KEY, token);
  }

  async function logout() {
    // Thu hồi token phía server (tăng tokenVersion) trước khi xóa ở trình
    // duyệt - best-effort, vẫn đăng xuất ở client dù request thất bại (mất
    // mạng...) để không bao giờ kẹt người dùng lại ở trạng thái đã đăng nhập.
    try {
      await apiLogout();
    } catch {
      // ignore - vẫn xóa token cục bộ bên dưới
    }
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, changePassword, isAuthenticated: !!admin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
