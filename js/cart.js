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

function stableStringify(obj) {
  const entries = Object.entries(obj || {}).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

function makeCartKey(product, selectedOptions) {
  return `${product.slug}__${stableStringify(selectedOptions)}`;
}

function serializeCart() {
  return JSON.stringify(
    Array.from(cart.entries()).map(([key, { product, quantity, selectedOptions }]) => ({
      key,
      quantity,
      product,
      selectedOptions,
    }))
  );
}

function hydrateCart(json) {
  cart.clear();
  const arr = JSON.parse(json);
  if (!Array.isArray(arr)) return;

  for (const item of arr) {
    if (!item?.key || typeof item.quantity !== "number") continue;
    if (!item.product) continue;

    cart.set(item.key, {
      product: item.product,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions || {},
    });
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

export function addToCart(product, qtyDelta = 1, selectedOptions = {}) {
  const opts = structuredClone ? structuredClone(selectedOptions) : JSON.parse(JSON.stringify(selectedOptions));
  const key = makeCartKey(product, opts);
  const current = cart.get(key)?.quantity || 0;

  const max = Number(product.inventory) > 0 ? Number(product.inventory) : Infinity;
  const next = Math.max(0, Math.min(current + qtyDelta, max));

  if (next === 0) cart.delete(key);
  else cart.set(key, { product, quantity: next, selectedOptions: opts });

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

export function getItemQuantity(product, selectedOptions = {}) {
  const key = makeCartKey(product, selectedOptions);
  return cart.get(key)?.quantity || 0;
}
