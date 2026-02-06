import { subscribeCart, getCartItems, getCartCount, addToCart } from "./cart.js";

const checkoutMenuButton = document.querySelector("#cart");
const checkoutMenu = document.querySelector(".checkout-container");
const crossOutMenuButton = document.querySelector(".exit-icon");

const contentContainer = document.querySelector(".checkout-container-main-content");
const totalEl = document.querySelector(".total-price");
const badge = document.querySelector(".badge");

const hasCheckoutUI = checkoutMenuButton && checkoutMenu && crossOutMenuButton && contentContainer && totalEl && badge;

function toggleCheckout(e) {
  e?.preventDefault?.();
  checkoutMenu.classList.toggle("is-open");
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
  totalEl.textContent = `Total price: ${total},-`;
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
  const { product, quantity } = item;

  const row = document.createElement("div");
  row.classList.add("checkout-container-flex");
  row.dataset.slug = product.slug;

  const img = document.createElement("img");
  img.classList.add("image-element-checkout");
  img.src = product.imageDark || product.imageLight || "";
  img.alt = product.title || "Produkt";
  row.appendChild(img);

  const title = document.createElement("p");
  title.classList.add("checkout-lamp-title");
  title.textContent = product.title ?? "";
  row.appendChild(title);

  const price = document.createElement("p");
  price.classList.add("checkout-lamp-price");
  price.textContent = `${product.basePrice},-`;
  row.appendChild(price);

  const remove = createButton(
    "Remove?",
    () => {
      addToCart(product, -quantity);
    },
    "delete-button"
  );

  row.appendChild(remove);

  return row;
}

function renderCheckout() {
  if (!contentContainer) return;

  const items = getCartItems();
  clear(contentContainer);

  const frag = document.createDocumentFragment();
  let total = 0;

  for (const item of items) {
    total += (Number(item.product.basePrice) || 0) * item.quantity;
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
