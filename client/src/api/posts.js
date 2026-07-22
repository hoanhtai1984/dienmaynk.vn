import apiClient from './client';

export async function getPosts(limit) {
  const { data } = await apiClient.get('/posts', { params: limit ? { limit } : {} });
  return data;
}

export async function getPost(slug) {
  const { data } = await apiClient.get(`/posts/${slug}`);
  return data;
}
