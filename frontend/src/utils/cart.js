// frontend/src/utils/cart.js
// Small utility to manage cart in localStorage.
// Cart shape: [{ id, title, price, slug, inventory, quantity, ...}, ...]

const CART_KEY = 'cart';

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch (e) {
    console.error('getCart parse error', e);
    return [];
  }
}

export function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(product, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, product.inventory || 9999);
  } else {
    cart.push({ ...pickProductForCart(product), quantity: Math.min(qty, product.inventory || 9999) });
  }
  setCart(cart);
  return cart;
}

export function updateQuantity(productId, quantity) {
  const cart = getCart().map(item => {
    if (item.id === productId) {
      return { ...item, quantity: Math.max(0, Number(quantity)) };
    }
    return item;
  }).filter(i => i.quantity > 0);
  setCart(cart);
  return cart;
}

export function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  setCart(cart);
  return cart;
}

export function clearCart() {
  setCart([]);
}

export function cartCount() {
  return getCart().reduce((s, i) => s + (i.quantity || 0), 0);
}

export function cartTotal() {
  return getCart().reduce((s, i) => s + (Number(i.price || 0) * (i.quantity || 0)), 0);
}

function pickProductForCart(p) {
  // keep only necessary fields to avoid huge objects in localStorage
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    inventory: p.inventory,
  };
}
