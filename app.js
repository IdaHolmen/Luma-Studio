//Image logic
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle");
  const holder = document.querySelector(".toggle-holder");

  if (!toggle) return;

  function changeImage(isDark) {
    document.body.classList.toggle("is-dark", isDark);
    toggle.checked = isDark;
  }

  changeImage(toggle.checked);

  toggle.addEventListener("change", (e) => {
    changeImage(e.target.checked);
  });

  if (holder) {
    holder.addEventListener("click", (e) => {
      if (e.target === toggle || e.target.classList.contains("slider")) return;

      changeImage(!toggle.checked);
    });
  }
});

//CHECKOUT
//Used this video to understand the different elements
//https://www.youtube.com/watch?v=YeFzkC2awTM&t=2s

const checkoutMenuButton = document.querySelector("#cart");
const checkoutMenu = document.querySelector(".checkout-container");
const crossOutMenuButton = document.querySelector(".exit-icon");
const headerContainer = document.querySelector(".header");

//When shopping-bag-icon is clicked the checkout is displayed and background is blurred
const displayCheckoutMenu = () => {
  checkoutMenu.style.display = checkoutMenu.style.display === "block" ? "none" : "block";

  const lampContainers = document.querySelectorAll(".lamp-container");
  lampContainers.forEach((lampContainer) => lampContainer.classList.toggle("lamp-container--blurred"));

  headerContainer.classList.toggle("header--blurred");
};
checkoutMenuButton.addEventListener("click", displayCheckoutMenu);

//crosses out menu
const crossOutMenu = () => {
  checkoutMenu.style.display = checkoutMenu.style.display === "block" ? "none" : "block";

  const lampContainers = document.querySelectorAll(".lamp-container");
  lampContainers.forEach((lampContainer) => lampContainer.classList.toggle("lamp-container--blurred"));

  headerContainer.classList.toggle("header--blurred");
};
crossOutMenuButton.addEventListener("click", crossOutMenu);

//ADD CONTENT TO CHECKOUT

const addContent = () => {
  const cartButtons = document.querySelectorAll(".add__button");
  const contentContainer = document.querySelector(".checkout-container-main-content");

  cartButtons.forEach((cartButton) => {
    cartButton.addEventListener("click", () => {
      const lampContainer = cartButton.closest(".lamp-container");

      //Creating the div dynamically!
      const newDiv = document.createElement("div");
      newDiv.classList.add("checkout-container-flex");

      const lampImage = lampContainer.querySelector(".lamp-image").cloneNode(true);
      lampImage.classList.add("image-element-checkout");
      newDiv.appendChild(lampImage);

      const lampTitleText = lampContainer.querySelector(".lamp-title").textContent;
      const titleElement = document.createElement("p");
      titleElement.classList.add("checkout-lamp-title");
      titleElement.textContent = lampTitleText;
      newDiv.appendChild(titleElement);

      const lampPrice = lampContainer.querySelector(".lamp-price").textContent;
      const priceElement = document.createElement("p");
      priceElement.classList.add("checkout-lamp-price");
      priceElement.textContent = lampPrice;
      newDiv.appendChild(priceElement);

      const quantityDiv = document.createElement("div");
      quantityDiv.classList.add("quantity-controls");

      const decrementButton = document.createElement("button");
      decrementButton.textContent = "-";
      decrementButton.onclick = () => updateQuantity(newDiv, -1);

      const incrementButton = document.createElement("button");
      incrementButton.textContent = "+";
      incrementButton.onclick = () => updateQuantity(newDiv, 1);

      const quantityDisplay = document.createElement("span");
      quantityDisplay.textContent = "1";
      quantityDisplay.classList.add("quantity-display");

      quantityDiv.appendChild(decrementButton);
      quantityDiv.appendChild(quantityDisplay);
      quantityDiv.appendChild(incrementButton);

      newDiv.appendChild(quantityDiv);

      const deleteLampButton = document.createElement("button");
      deleteLampButton.classList.add("delete-button");
      deleteLampButton.textContent = "Remove?";
      deleteLampButton.addEventListener("click", (event) => {
        event.target.parentElement.remove();
        updateTotal();
        updateBadgeCount();
      });

      newDiv.appendChild(deleteLampButton);

      contentContainer.appendChild(newDiv);
      updateTotal();
      updateBadgeCount();
      updateQuantity();
    });
  });
};
addContent();

// QUANTITY
const updateQuantity = (cartItem, change) => {
  if (!cartItem) return; // guard

  const quantityDisplay = cartItem.querySelector(".quantity-display");
  if (!quantityDisplay) return;

  let quantity = parseInt(quantityDisplay.textContent, 10);
  quantity = Math.max(1, quantity + change);
  quantityDisplay.textContent = String(quantity);

  updateTotal();
};

//TOTAL SUM
const updateTotal = () => {
  let total = 0;

  const cartItems = document.querySelectorAll(".checkout-container-flex");
  cartItems.forEach((cartItem) => {
    const price = parseInt(cartItem.querySelector(".checkout-lamp-price").textContent.replace(",-", ""));
    const quantity = parseInt(cartItem.querySelector(".quantity-display").textContent);
    total += price * quantity;
  });

  document.querySelector(".total-price").innerText = "Total price: " + total + ",-";
};

//BADGE
const badge = document.querySelector(".badge");

// If item is added to cart it displays the badge and changes textContent accordingly
const updateBadgeCount = () => {
  const cartItems = document.querySelectorAll(".checkout-container-flex");
  const badgeCount = cartItems.length;

  console.log(badgeCount);
  if (badgeCount > 0) {
    badge.textContent = badgeCount;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }
};

const contentContainer = document.querySelector("#products");

async function getProducts() {
  try {
    const response = await fetch("http://localhost:3000/api/products");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error("Feil i getProducts():", error);

    const errorMessage = document.createElement("div");
    errorMessage.classList.add("error-message");
    errorMessage.textContent = "Det har skjedd en feil. Vennligst prøv igjen.";
    contentContainer.append(errorMessage);
  }
}

function renderProducts(products) {
  contentContainer.textContent = "";

  const fragment = document.createDocumentFragment();

  products
    .sort((a, b) => a.index - b.index)
    .forEach((p) => {
      const wrapper = document.createElement("div");
      wrapper.classList.add("lamp-container");
      wrapper.dataset.index = p.index;
      wrapper.dataset.type = p.type;

      const link = document.createElement("a");
      link.classList.add(`lamp-${p.index + 1}`);

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

      const price = document.createElement("div");
      price.classList.add("lamp-price");
      price.textContent = `${p.price},-`;

      const title = document.createElement("p");
      title.classList.add("lamp-title");
      title.textContent = p.title;

      stage.append(imageLight, imageDark);
      info.append(title, price);
      link.append(stage, info);
      wrapper.append(link);
      fragment.append(wrapper);
    });

  contentContainer.append(fragment);
}

getProducts();
