import axios from 'axios';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || `http://${window.location.hostname}:8000`;

export async function sendChatMessage(message, contextProductIds = []) {
  const token = localStorage.getItem('dmnk_customer_token');
  const { data } = await axios.post(
    `${AI_SERVICE_URL}/chatbot`,
    { message, context_product_ids: contextProductIds },
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
  );
  return data;
}
