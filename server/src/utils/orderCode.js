function generateOrderCode() {
  const timePart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DH${timePart}${randomPart}`;
}

module.exports = { generateOrderCode };
