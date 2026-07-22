import apiClient from './client';

export async function createOrder(payload) {
  const { data } = await apiClient.post('/orders', payload);
  return data;
}
