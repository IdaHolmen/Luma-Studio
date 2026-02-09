import { subscribeCart, getCartItems, getCartCount, addToCart } from "./cart.js";

function formatChosenOptions(selectedOptions) {
  const labels = selectedOptions?.optionLabels || {};
  const values = selectedOptions?.optionValues || {};

  const list = Object.keys(labels).length ? Object.values(labels).filter(Boolean) : Object.values(values).filter(Boolean).map(String);

  if (list.length === 0) return "Valgt: —";
  return `${list.join(", ")}`;
}

const checkoutMenuButton = document.querySelector("#cart");
const checkoutMenu = document.querySelector(".checkout-container");
const crossOutMenuButton = document.querySelector(".exit-cart-button");

const contentContainer = document.querySelector(".checkout-container-main-content");
const totalEl = document.querySelector(".total-price");
const badge = document.querySelector(".badge");

const hasCheckoutUI = checkoutMenuButton && checkoutMenu && crossOutMenuButton && contentContainer && totalEl && badge;

const toggleCheckout = () => {
  checkoutMenu.classList.toggle("is-open");
  document.body.classList.toggle("checkout-open");
};

function createStepper({ product, quantity, selectedOptions }) {
  const wrap = document.createElement("div");
  wrap.classList.add("numeric-stepper-container");

  const minus = createButton("-", () => addToCart(product, -1, selectedOptions), "numeric-button-reduce");

  const value = document.createElement("span");
  value.classList.add("numeric-element");
  value.textContent = String(quantity);

  const plus = createButton("+", () => addToCart(product, 1, selectedOptions), "numeric-button-increment");

  const max = Number(product.inventory) > 0 ? Number(product.inventory) : 0;

  if (max > 0 && quantity >= max) plus.disabled = true;

  wrap.append(minus, value, plus);
  return wrap;
}

if (checkoutMenuButton && checkoutMenu && crossOutMenuButton) {
  checkoutMenuButton.addEventListener("click", toggleCheckout);
  crossOutMenuButton.addEventListener("click", toggleCheckout);
}

function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function setBadge() {
  if (!badge) return;
  const count = getCartCount();

  if (count > 0) {
    badge.textContent = String(count);
    badge.style.display = "flex";
  } else {
    badge.textContent = "";
    badge.style.display = "none";
  }
}

function setTotal(total) {
  if (!totalEl) return;
  totalEl.textContent = `Totalpris: ${total},-`;
}

function createButton(label, onClick, className) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  if (className) btn.classList.add(className);
  btn.addEventListener("click", onClick);
  return btn;
}

function createCartRow(item) {
  const { product, quantity, selectedOptions } = item;

  const row = document.createElement("div");
  row.classList.add("checkout-container-flex");
  row.dataset.slug = product.slug;

  const img = document.createElement("img");
  img.classList.add("image-element-checkout");
  img.src = product.imageDark || product.imageLight || "";
  img.alt = product.title || "Produkt";
  row.appendChild(img);

  const detailWrapper = document.createElement("div");
  detailWrapper.classList.add("checkout-detail-wrapper");
  row.appendChild(detailWrapper);

  const title = document.createElement("p");
  title.classList.add("checkout-lamp-title");
  title.textContent = product.title ?? "";
  detailWrapper.appendChild(title);

  const price = document.createElement("p");
  price.classList.add("checkout-lamp-price");
  price.textContent = `${Number(item.unitPrice) || Number(product.basePrice) || 0},-`;
  detailWrapper.appendChild(price);

  const chosenOption = document.createElement("p");
  chosenOption.classList.add("checkout-chosen-option");
  chosenOption.textContent = formatChosenOptions(selectedOptions);
  detailWrapper.appendChild(chosenOption);

  const stepper = createStepper({ product, quantity, selectedOptions });
  row.appendChild(stepper);

  return row;
}

function createEmptyState() {
  const wrap = document.createElement("div");
  wrap.classList.add("checkout-empty-state");

  const text = document.createElement("p");
  text.textContent = "Handlekurven er tom";
  text.classList.add("checkout-empty-text");

  wrap.appendChild(text);
  return wrap;
}

function renderCheckout() {
  if (!contentContainer) return;

  const items = getCartItems();
  clear(contentContainer);

  if (items.length === 0) {
    contentContainer.appendChild(createEmptyState());
    setTotal(0);
    setBadge();
    return;
  }

  const frag = document.createDocumentFragment();
  let total = 0;

  for (const item of items) {
    total += (Number(item.unitPrice) || 0) * item.quantity;
    frag.appendChild(createCartRow(item));
  }

  contentContainer.appendChild(frag);
  setTotal(total);
  setBadge();
}

if (hasCheckoutUI) {
  document.addEventListener("DOMContentLoaded", () => {
    renderCheckout();
    subscribeCart(renderCheckout);
  });
}
