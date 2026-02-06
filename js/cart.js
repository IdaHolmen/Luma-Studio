const STORAGE_KEY = "luma_cart_v1";

const cart = new Map();
const listeners = new Set();

export function subscribeCart(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn();
}

function serializeCart() {
  return JSON.stringify(
    Array.from(cart.entries()).map(([slug, { product, quantity }]) => ({
      slug,
      quantity,
      product,
    }))
  );
}

function hydrateCart(json) {
  cart.clear();
  const arr = JSON.parse(json);
  if (!Array.isArray(arr)) return;

  for (const item of arr) {
    if (!item?.slug || typeof item.quantity !== "number") continue;
    if (!item.product) continue;

    cart.set(item.slug, { product: item.product, quantity: item.quantity });
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, serializeCart());
  } catch (e) {
    console.warn("Kunne ikke lagre cart til localStorage:", e);
  }
}

export function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    hydrateCart(raw);
    notify();
  } catch (e) {
    console.warn("Kunne ikke laste cart fra localStorage:", e);
  }
}

export function clearCart() {
  cart.clear();
  saveToStorage();
  notify();
}

export function addToCart(product, qtyDelta = 1) {
  const slug = product.slug;
  const current = cart.get(slug)?.quantity || 0;

  const max = Number(product.inventory) > 0 ? Number(product.inventory) : Infinity;
  const next = Math.max(0, Math.min(current + qtyDelta, max));

  if (next === 0) cart.delete(slug);
  else cart.set(slug, { product, quantity: next });

  saveToStorage();
  notify();
}

export function getCartItems() {
  return Array.from(cart.values());
}

export function getCartCount() {
  let count = 0;
  for (const item of cart.values()) count += item.quantity;
  return count;
}

export function getItemQuantity(slug) {
  return cart.get(slug)?.quantity || 0;
}
