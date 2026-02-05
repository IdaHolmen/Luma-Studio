// FETCHING PRODUCTS FROM DATABASE
export async function fetchProducts() {
  const response = await fetch("http://localhost:3000/api/products");
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);

  const data = await response.json();

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.products)) return data.products;
  if (Array.isArray(data.data)) return data.data;

  console.error("Uventet format fra /api/products:", data);
  return [];
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function hasCategory(product, category) {
  const cats = Array.isArray(product.category) ? product.category : [product.category];
  return cats.map(normalize).includes(normalize(category));
}

export function renderCards(products, container, containerClass = "content-container") {
  if (!container) return;

  container.textContent = "";
  container.classList.add(containerClass);

  const fragment = document.createDocumentFragment();

  products
    .slice()
    .sort((a, b) => a.index - b.index)
    .forEach((p) => {
      const card = document.createElement("div");
      card.classList.add("lamp-container");

      const stage = document.createElement("div");
      stage.classList.add("lamp-stage");

      const imageLight = document.createElement("img");
      imageLight.classList.add("lamp-image");
      imageLight.src = p.imageLight;
      imageLight.alt = p.title;

      const imageDark = document.createElement("img");
      imageDark.classList.add("lamp-image__dark");
      imageDark.src = p.imageDark;
      imageDark.alt = p.title;

      const info = document.createElement("div");
      info.classList.add("lamp-info");

      const title = document.createElement("h3");
      title.classList.add("lamp-title");
      title.textContent = p.title;

      const description = document.createElement("p");
      description.classList.add("lamp-description");
      description.textContent = p.description;

      const price = document.createElement("h4");
      price.classList.add("lamp-price");
      price.textContent = `Pris: ${p.basePrice},-`;

      const infoWrapper = document.createElement("div");
      infoWrapper.classList.add("info-wrapper");

      const buttonWrapper = document.createElement("div");
      buttonWrapper.classList.add("button-wrapper");

      const viewProduct = document.createElement("a");
      viewProduct.classList.add("view-product");

      viewProduct.href = `info.html?slug=${encodeURIComponent(p.slug)}`;
      viewProduct.textContent = "Se produkt";

      stage.append(imageLight, imageDark);
      infoWrapper.append(title, description);
      info.append(infoWrapper, buttonWrapper);
      buttonWrapper.append(price, viewProduct);
      card.append(stage, info);

      fragment.append(card);
    });

  container.append(fragment);
}
