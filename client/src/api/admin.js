import apiClient from './client';

export async function login(email, password) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
}

export async function getMe() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function changePassword(currentPassword, newPassword) {
  const { data } = await apiClient.put('/auth/change-password', { currentPassword, newPassword });
  return data;
}

export async function listAdminProducts() {
  const { data } = await apiClient.get('/admin/products');
  return data;
}

export async function getAdminProduct(id) {
  const { data } = await apiClient.get(`/admin/products/${id}`);
  return data;
}

export async function createAdminProduct(formData) {
  const { data } = await apiClient.post('/admin/products', formData);
  return data;
}

export async function bulkCreateAdminProducts(rows) {
  const { data } = await apiClient.post('/admin/products/bulk', { rows });
  return data;
}

export async function updateAdminProduct(id, formData) {
  const { data } = await apiClient.put(`/admin/products/${id}`, formData);
  return data;
}

export async function deleteAdminProduct(id) {
  await apiClient.delete(`/admin/products/${id}`);
}

export async function deleteAdminProductImage(productId, imageId) {
  await apiClient.delete(`/admin/products/${productId}/images/${imageId}`);
}

export async function listAdminOrders(status) {
  const { data } = await apiClient.get('/admin/orders', { params: status ? { status } : {} });
  return data;
}

export async function getAdminOrder(id) {
  const { data } = await apiClient.get(`/admin/orders/${id}`);
  return data;
}

export async function updateAdminOrderStatus(id, status) {
  const { data } = await apiClient.patch(`/admin/orders/${id}`, { status });
  return data;
}

export async function getLatestSalesReport() {
  const { data } = await apiClient.get('/admin/reports/sales/latest');
  return data;
}

export async function listAdminSalesReports(from, to) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const { data } = await apiClient.get('/admin/reports/sales', { params });
  return data;
}

export async function listAdminPosts() {
  const { data } = await apiClient.get('/admin/posts');
  return data;
}

export async function getAdminPost(id) {
  const { data } = await apiClient.get(`/admin/posts/${id}`);
  return data;
}

export async function createAdminPost(formData) {
  const { data } = await apiClient.post('/admin/posts', formData);
  return data;
}

export async function updateAdminPost(id, formData) {
  const { data } = await apiClient.put(`/admin/posts/${id}`, formData);
  return data;
}

export async function deleteAdminPost(id) {
  await apiClient.delete(`/admin/posts/${id}`);
}

export async function listAdminCustomers(q) {
  const { data } = await apiClient.get('/admin/customers', { params: q ? { q } : {} });
  return data;
}

export async function getAdminCustomer(id) {
  const { data } = await apiClient.get(`/admin/customers/${id}`);
  return data;
}

export async function createAdminCustomer(payload) {
  const { data } = await apiClient.post('/admin/customers', payload);
  return data;
}

export async function setCustomerNeedsAttention(id, needsAttention) {
  const { data } = await apiClient.patch(`/admin/customers/${id}/needs-attention`, { needsAttention });
  return data;
}

export async function listAdminContacts(status) {
  const { data } = await apiClient.get('/admin/contacts', { params: status ? { status } : {} });
  return data;
}

export async function updateAdminContactStatus(id, status) {
  const { data } = await apiClient.patch(`/admin/contacts/${id}`, { status });
  return data;
}

export async function listAdminChatMessages(needsHelpOnly) {
  const { data } = await apiClient.get('/admin/chat-messages', { params: needsHelpOnly ? { needsHelp: 'true' } : {} });
  return data;
}

export async function listAdminNewsletter() {
  const { data } = await apiClient.get('/admin/newsletter');
  return data;
}

export async function listAdminMembers() {
  const { data } = await apiClient.get('/admin/members');
  return data;
}

export async function createAdminMember(payload) {
  const { data } = await apiClient.post('/admin/members', payload);
  return data;
}

export async function deleteAdminMember(id) {
  await apiClient.delete(`/admin/members/${id}`);
}

export async function resetAdminMemberPassword(id, password) {
  const { data } = await apiClient.post(`/admin/members/${id}/reset-password`, password ? { password } : undefined);
  return data;
}

export async function getAdminMemberActivity(params) {
  const { data } = await apiClient.get('/admin/members/activity', { params });
  return data;
}

export async function getCustomerActivity(params) {
  const { data } = await apiClient.get('/admin/customers/activity', { params });
  return data;
}
