import { fetchProducts } from "./cards.js";
import { addToCart, subscribeCart, getItemQuantity } from "./cart.js";

function formatPriceNOK(value) {
  return `Pris: ${value} kr`;
}

function calculateTotalPrice(product, selected) {
  let total = Number(product.basePrice) || 0;

  for (const group of product.optionGroups || []) {
    const chosen = selected[group.key];
    if (!chosen) continue;

    const option = (group.options || []).find((opt) => opt.value === chosen);
    if (option) total += Number(option.priceDelta) || 0;
  }
  return total;
}

function shouldShowGroup(group, selected) {
  if (!group.dependsOn) return true;
  return selected[group.dependsOn.key] === group.dependsOn.value;
}

function updateGroupSelectedStyles(rowElement, groupKey) {
  const inputs = rowElement.querySelectorAll(`input[name="${groupKey}"]`);
  inputs.forEach((input) => {
    const label = input.nextElementSibling;
    if (!label) return;
    label.classList.toggle("is-selected", input.checked);
  });
}
function renderOptionGroups({ product, selectionContainer, priceEl, imageEl, onValidityChange }) {
  const selected = {};
  const wrapsByKey = new Map();

  while (selectionContainer.firstChild) {
    selectionContainer.removeChild(selectionContainer.firstChild);
  }

  const groups = (product.optionGroups || []).filter((group) => group.select === true);

  if (groups.length === 0) {
    onValidityChange?.(true);
    return selected;
  }

  function updatePurchaseButtonState() {
    const missingRequired = groups.some((group) => {
      if (group.required !== true) return false;
      if (!shouldShowGroup(group, selected)) return false;
      return !selected[group.key];
    });

    onValidityChange?.(!missingRequired);
  }

  for (const group of groups) {
    const wrap = document.createElement("div");
    wrap.classList.add("option-group-wrap");
    wrap.dataset.groupKey = group.key;

    const title = document.createElement("div");
    title.classList.add("option-group-title");
    title.textContent = group.label || group.key;

    const row = document.createElement("div");
    row.classList.add("option-row");

    wrap.append(title, row);
    selectionContainer.append(wrap);
    wrapsByKey.set(group.key, wrap);

    for (const opt of group.options || []) {
      const id = `${group.key}-${opt.value}`;

      const input = document.createElement("input");
      input.classList.add("option-radio");
      input.type = "radio";
      input.name = group.key;
      input.id = id;
      input.value = opt.value;

      const label = document.createElement("label");
      label.classList.add("option-card");
      label.setAttribute("for", id);

      const t = document.createElement("span");
      t.classList.add("option-title");
      t.textContent = opt.label;

      const p = document.createElement("span");
      p.classList.add("option-price");
      const delta = Number(opt.priceDelta) || 0;
      p.textContent = delta === 0 ? "Inkludert" : `+${delta} kr`;

      label.append(t, p);

      input.addEventListener("change", () => {
        selected[group.key] = opt.label;

        const isColorGroup = group.key.toLowerCase().includes("color");
        if (isColorGroup && imageEl) {
          const nextSrc = product.imageVariants?.color?.[opt.value];
          imageEl.src = nextSrc || product.imageDark;
        }

        updateGroupSelectedStyles(row, group.key);

        for (const g of groups) {
          const gWrap = wrapsByKey.get(g.key);
          if (!gWrap) continue;

          const visible = shouldShowGroup(g, selected);
          gWrap.hidden = !visible;

          if (!visible && selected[g.key]) {
            delete selected[g.key];
            gWrap.querySelectorAll(`input[name="${g.key}"]`).forEach((i) => (i.checked = false));

            const gRow = gWrap.querySelector(".option-row");
            if (gRow) updateGroupSelectedStyles(gRow, g.key);
          }
        }

        const total = calculateTotalPrice(product, selected);
        priceEl.textContent = formatPriceNOK(total);

        updatePurchaseButtonState();
      });

      row.append(input, label);
    }

    updateGroupSelectedStyles(row, group.key);
  }

  priceEl.textContent = formatPriceNOK(calculateTotalPrice(product, selected));

  for (const group of groups) {
    const wrap = wrapsByKey.get(group.key);
    if (!wrap) continue;
    wrap.hidden = !shouldShowGroup(group, selected);
  }
  updatePurchaseButtonState();

  return selected;
}

(async function initProductPage() {
  const main = document.querySelector(".product-main-container");
  if (!main) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    main.textContent = "Mangler slug i URL. Eksempel: info.html?slug=dis-bordlampe";
    return;
  }

  try {
    const products = await fetchProducts();

    const product = products.find((p) => p.slug === slug);

    if (!product) {
      main.textContent = `Fant ikke produktet for slug: ${slug}`;
      return;
    }

    main.textContent = "";

    // CREATING TWO CONTAINERS FOR THE CONTENT OF THE PAGE
    const productInfoContainer = document.createElement("div");
    const productImageContainer = document.createElement("div");
    // CREATING ALL THE DIVS TO DISPLAY THE PRODUCT INFORMATION
    const heading = document.createElement("div");
    const descriptionContainer = document.createElement("div");
    const selectionContainer = document.createElement("div");
    const pricingCheckoutContainer = document.createElement("div");
    // CREATING PRODUCT INFO ELEMENTS
    const headline = document.createElement("h1");
    const productID = document.createElement("div");
    const stock = document.createElement("p");
    const description = document.createElement("p");
    const price = document.createElement("p");
    const purchaseButton = document.createElement("button");
    // CREATING IMAGE ELEMENT
    const image = document.createElement("img");

    // ADDING CLASSES
    productInfoContainer.classList.add("product-info-container");
    productImageContainer.classList.add("product-image-container");
    heading.classList.add("products-heading");
    descriptionContainer.classList.add("products-description-container");
    selectionContainer.classList.add("selection-container-products");
    pricingCheckoutContainer.classList.add("pricing-checkout-container");
    headline.classList.add("product-headline");
    productID.classList.add("product-id");
    description.classList.add("product-description");
    price.classList.add("product-price");
    stock.classList.add("product-inventory");
    purchaseButton.classList.add("purchase-button");

    // ADDING CONTENT
    headline.textContent = product.title;
    productID.textContent = `ID: ${product._id}`;
    stock.textContent = Number(product.inventory) > 0 ? `På lager: ${product.inventory}` : "Utsolgt";
    description.textContent = product.description;
    price.textContent = formatPriceNOK(Number(product.basePrice) || 0);
    purchaseButton.textContent = "Legg i handlekurv";
    image.src = product.imageDark;

    // APPENDING
    main.append(productInfoContainer, productImageContainer);
    productInfoContainer.append(heading, descriptionContainer, selectionContainer, pricingCheckoutContainer);
    productImageContainer.append(image);
    heading.append(headline, productID, stock);
    descriptionContainer.append(description);
    pricingCheckoutContainer.append(price);

    let selectedOptions = {};
    const getSelectedOptions = () => ({ ...selectedOptions });

    const stepperCtrl = mountStepper({
      host: pricingCheckoutContainer,
      product,
      purchaseButton,
      getSelectedOptions,
    });

    function mountStepper({ host, product, purchaseButton, getSelectedOptions }) {
      const callToActionWrapper = document.createElement("div");
      callToActionWrapper.classList.add("call-to-action-wrapper");
      host.appendChild(callToActionWrapper);

      const stepper = document.createElement("div");
      stepper.classList.add("numeric-stepper-container");

      const minus = document.createElement("button");
      minus.type = "button";
      minus.classList.add("numeric-button-reduce");
      minus.textContent = "-";

      const quantityElement = document.createElement("div");
      quantityElement.classList.add("numeric-element");
      quantityElement.textContent = "1";

      const plus = document.createElement("button");
      plus.type = "button";
      plus.classList.add("numeric-button-increment");
      plus.textContent = "+";

      stepper.append(minus, quantityElement, plus);

      const max = Number(product.inventory) > 0 ? Number(product.inventory) : 0;
      let optionsReady = false;

      function setOptionsReady(next) {
        optionsReady = !!next;
        render();
      }

      function render() {
        const quantity = getItemQuantity(product, getSelectedOptions?.() || {});

        if (max <= 0) {
          callToActionWrapper.textContent = "";
          purchaseButton.disabled = true;
          purchaseButton.textContent = "Utsolgt";
          callToActionWrapper.appendChild(purchaseButton);
          return;
        }

        if (quantity <= 0) {
          callToActionWrapper.textContent = "";
          purchaseButton.disabled = !optionsReady;
          purchaseButton.textContent = optionsReady ? "Legg i handlekurv" : "Velg alternativ";
          callToActionWrapper.appendChild(purchaseButton);
          return;
        }

        callToActionWrapper.textContent = "";
        quantityElement.textContent = String(quantity);

        minus.disabled = false;

        plus.disabled = quantity >= max || !optionsReady;

        callToActionWrapper.appendChild(stepper);
      }

      purchaseButton.type = "button";
      purchaseButton.addEventListener("click", () => {
        if (!optionsReady) return;
        addToCart(product, 1, getSelectedOptions?.() || {});
      });
      minus.addEventListener("click", () => addToCart(product, -1, getSelectedOptions?.() || {}));
      plus.addEventListener("click", () => {
        if (!optionsReady) return;
        addToCart(product, 1, getSelectedOptions?.() || {});
      });

      render();
      subscribeCart(render);

      return { setOptionsReady };
    }

    if (Array.isArray(product.optionGroups) && product.optionGroups.length > 0) {
      selectedOptions = renderOptionGroups({
        product,
        selectionContainer,
        priceEl: price,
        imageEl: image,
        onValidityChange: stepperCtrl.setOptionsReady,
      });
    } else {
      stepperCtrl.setOptionsReady(true);
    }
  } catch (err) {
    console.error("Feil ved henting av produkt:", err);
    main.textContent = "Kunne ikke laste produktet akkurat nå.";
  }
})();
