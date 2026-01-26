// PRODUCT PAGE
(async function initRoProductPage() {
  const productInfoContainer = document.querySelector(".product-info-container");
  if (!productInfoContainer) return;

  const PRODUCT_SLUG = "ro-bordlampe";

  try {
    const res = await fetch("http://localhost:3000/api/products");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const products = await res.json();

    const product = products.find((p) => p.slug === PRODUCT_SLUG) || products.find((p) => (p.title || "").toLowerCase().includes("ro"));

    if (!product) {
      productInfoContainer.textContent = "Fant ikke produktet.";
      return;
    }

    productInfoContainer.textContent = "";

    const productsHeading = document.createElement("div");
    productsHeading.classList.add("products-heading");

    const productDescriptionContainer = document.createElement("div");
    productDescriptionContainer.classList.add("products-description-container");

    const selectionContainer = document.createElement("div");
    selectionContainer.classList.add("selection-container-products");

    const pricingCheckoutContainer = document.createElement("div");
    pricingCheckoutContainer.classList.add("pricing-checkout-container");

    const productHeadline = document.createElement("h1");
    productHeadline.classList.add("product-headline");
    productHeadline.textContent = product.title;

    const productID = document.createElement("p");
    productID.classList.add("product-id");
    productID.textContent = String(product._id);

    const description = document.createElement("p");
    description.classList.add("product-description");
    description.textContent = product.description;

    const price = document.createElement("p");
    price.classList.add("product-price");
    price.textContent = `${product.price},-`;

    const stock = document.createElement("p");
    stock.classList.add("product-inventory");
    stock.textContent = Number(product.inventory) > 0 ? `På lager: ${product.inventory}` : "Utsolgt";

    productsHeading.append(productHeadline, productID, stock);
    productDescriptionContainer.append(description);
    pricingCheckoutContainer.append(price);
    productInfoContainer.append(productsHeading, productDescriptionContainer, selectionContainer, pricingCheckoutContainer);
  } catch (err) {
    console.error("Feil ved henting av produkt:", err);
    productInfoContainer.textContent = "Kunne ikke laste produktet akkurat nå.";
  }
})();
