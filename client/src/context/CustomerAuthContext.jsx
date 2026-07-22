import { createContext, useContext, useEffect, useState } from 'react';
import * as customerAuthApi from '../api/customerAuth';

const TOKEN_KEY = 'dmnk_customer_token';
const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    customerAuthApi
      .getMe()
      .then(setCustomer)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { token, customer: customerData } = await customerAuthApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, token);
    setCustomer(customerData);
  }

  async function loginWithGoogle(credential) {
    const { token, customer: customerData } = await customerAuthApi.googleLogin(credential);
    localStorage.setItem(TOKEN_KEY, token);
    setCustomer(customerData);
  }

  async function loginWithFacebook(accessToken) {
    const { token, customer: customerData } = await customerAuthApi.facebookLogin(accessToken);
    localStorage.setItem(TOKEN_KEY, token);
    setCustomer(customerData);
  }

  async function register(payload) {
    const { token, customer: customerData } = await customerAuthApi.register(payload);
    localStorage.setItem(TOKEN_KEY, token);
    setCustomer(customerData);
  }

  async function updateProfile(payload) {
    const updated = await customerAuthApi.updateMe(payload);
    setCustomer(updated);
    return updated;
  }

  // Xoá tài khoản luôn kèm đăng xuất ở client ngay (server đã tăng
  // tokenVersion nên token cũ đằng nào cũng hết hiệu lực) - không cần gọi
  // logout() riêng nữa.
  async function deleteAccount() {
    await customerAuthApi.deleteMe();
    localStorage.removeItem(TOKEN_KEY);
    setCustomer(null);
  }

  async function logout() {
    // Thu hồi token phía server (tăng tokenVersion) trước khi xóa ở trình
    // duyệt - best-effort, vẫn đăng xuất ở client dù request thất bại (mất
    // mạng...) để không bao giờ kẹt người dùng lại ở trạng thái đã đăng nhập.
    try {
      await customerAuthApi.logout();
    } catch {
      // ignore - vẫn xóa token cục bộ bên dưới
    }
    localStorage.removeItem(TOKEN_KEY);
    setCustomer(null);
  }

  return (
    <CustomerAuthContext.Provider
      value={{
        customer, loading, login, loginWithGoogle, loginWithFacebook, register, logout,
        updateProfile, deleteAccount, isAuthenticated: !!customer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
