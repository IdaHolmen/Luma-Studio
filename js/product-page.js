// product-page.js
(async function initProductPage() {
  const main = document.querySelector(".product-main-container");
  if (!main) return;

  // Les slug fra URL: info.html?slug=dis-bordlampe
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    main.textContent = "Mangler slug i URL. Eksempel: info.html?slug=dis-bordlampe";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/products");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const products = await res.json();

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
    const productID = document.createElement("p");
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
    productID.textContent = String(product._id);
    stock.textContent = Number(product.inventory) > 0 ? `På lager: ${product.inventory}` : "Utsolgt";
    description.textContent = product.description;
    price.textContent = String(product.price);
    purchaseButton.textContent = "Legg i handlekurv";
    image.src = product.imageDark;

    // APPENDING
    main.append(productInfoContainer, productImageContainer);
    productInfoContainer.append(heading, descriptionContainer, selectionContainer, pricingCheckoutContainer);
    productImageContainer.append(image);
    heading.append(headline, productID, stock);
    descriptionContainer.append(description);
    pricingCheckoutContainer.append(price, purchaseButton);
  } catch (err) {
    console.error("Feil ved henting av produkt:", err);
    main.textContent = "Kunne ikke laste produktet akkurat nå.";
  }
})();
