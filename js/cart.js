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

function makeCartKey(product, selection) {
  const { optionValues } = normalizeSelection(selection);
  return `${product.slug}__${stableStringify(optionValues)}`;
}

function serializeCart() {
  return JSON.stringify(
    Array.from(cart.entries()).map(([key, { product, quantity, selectedOptions, unitPrice }]) => ({
      key,
      quantity,
      product,
      selectedOptions,
      unitPrice,
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
      selectedOptions: item.selectedOptions || { optionValues: {}, optionLabels: {} },
      unitPrice: typeof item.unitPrice === "number" ? item.unitPrice : Number(item.product?.basePrice) || 0,
    });
  }
}

function calculateTotalPrice(product, optionValues) {
  let total = Number(product.basePrice) || 0;

  for (const group of product.optionGroups || []) {
    const chosenValue = optionValues?.[group.key];
    if (!chosenValue) continue;

    const option = (group.options || []).find((opt) => opt.value === chosenValue);
    if (option) total += Number(option.priceDelta) || 0;
  }
  return total;
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

function normalizeSelection(selectedOptions) {
  if (selectedOptions && typeof selectedOptions === "object" && ("optionValues" in selectedOptions || "optionLabels" in selectedOptions)) {
    return {
      optionValues: selectedOptions.optionValues || {},
      optionLabels: selectedOptions.optionLabels || {},
    };
  }

  return { optionValues: selectedOptions || {}, optionLabels: {} };
}

export function addToCart(product, qtyDelta = 1, selectedOptions = {}) {
  const selection = normalizeSelection(selectedOptions);

  const opts = structuredClone ? structuredClone(selection) : JSON.parse(JSON.stringify(selection));

  const key = makeCartKey(product, opts);
  const current = cart.get(key)?.quantity || 0;

  const max = Number(product.inventory) > 0 ? Number(product.inventory) : Infinity;
  const next = Math.max(0, Math.min(current + qtyDelta, max));

  if (next === 0) cart.delete(key);
  else {
    const unitPrice = calculateTotalPrice(product, opts.optionValues);
    cart.set(key, {
      product,
      quantity: next,
      selectedOptions: opts,
      unitPrice,
    });
  }

  saveToStorage();
  notify();
}

export function getCartItems() {
  return Array.from(cart.values()).map((item) => {
    if (typeof item.unitPrice === "number") return item;
    const selection = normalizeSelection(item.selectedOptions);
    return { ...item, selectedOptions: selection, unitPrice: calculateTotalPrice(item.product, selection.optionValues) };
  });
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
