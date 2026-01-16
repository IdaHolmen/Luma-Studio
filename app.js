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

const checkoutMenuButton = document.querySelector(".shopping-bag");
const checkoutMenu = document.querySelector(".checkout-container");
const crossOutMenuButton = document.querySelector(".exit-icon");
const headerContainer = document.querySelector(".header");

//When shopping-bag-icon is clicked the checkout is displayed and background is blurred
const displayCheckoutMenu = () => {
  checkoutMenu.style.display = checkoutMenu.style.display === "block" ? "none" : "block";

  const lampContainers = document.querySelectorAll(".lamp__container");
  lampContainers.forEach((lampContainer) => lampContainer.classList.toggle("lamp__container--blurred"));

  headerContainer.classList.toggle("header--blurred");
};
checkoutMenuButton.addEventListener("click", displayCheckoutMenu);

//crosses out menu
const crossOutMenu = () => {
  checkoutMenu.style.display = checkoutMenu.style.display === "block" ? "none" : "block";

  const lampContainers = document.querySelectorAll(".lamp__container");
  lampContainers.forEach((lampContainer) => lampContainer.classList.toggle("lamp__container--blurred"));

  headerContainer.classList.toggle("header--blurred");
};
crossOutMenuButton.addEventListener("click", crossOutMenu);

//ADD CONTENT TO CHECKOUT

const addContent = () => {
  const cartButtons = document.querySelectorAll(".add__button");
  const contentContainer = document.querySelector(".checkout-container-main-content");

  cartButtons.forEach((cartButton) => {
    cartButton.addEventListener("click", () => {
      const lampContainer = cartButton.closest(".lamp__container");

      //Creating the div dynamically!
      const newDiv = document.createElement("div");
      newDiv.classList.add("checkout-container-flex");

      const lampImage = lampContainer.querySelector(".lamp-image").cloneNode(true);
      lampImage.classList.add("image-element-checkout");
      newDiv.appendChild(lampImage);

      const lampTitleText = lampContainer.querySelector(".lamp__title").textContent;
      const titleElement = document.createElement("p");
      titleElement.classList.add("checkout-lamp-title");
      titleElement.textContent = lampTitleText;
      newDiv.appendChild(titleElement);

      const lampPrice = lampContainer.querySelector(".lamp__price").textContent;
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

//Makes sure that badge is not visible when page is loaded
document.addEventListener("DOMContentLoaded", () => {
  badge.style.display = "none";
  updateBadgeCount();
});

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

async function renderProducts() {
  const res = await fetch("http://localhost:3000/api/products");
  const products = await res.json();

  const container = document.querySelector("#products");

  container.innerHTML = products
    .sort((a, b) => a.index - b.index)
    .map(
      (p) => `
      <div class="lamp__container" data-index="${p.index}" data-type="${p.type}">
        <a class="lamp-${p.index + 1}">
          <div class="lamp-stage">
            <img src="${p.imageLight}" alt="${p.title}" class="lamp-image" />
            <img src="${p.imageDark}" alt="${p.title}" class="lamp-image__dark" />
          </div>
          <div class="lamp__info">
            <div class="lamp__price">${p.price},-</div>
            <p class="lamp__title">${p.title}</p>
            <button class="add__button">Legg i handlevogn</button>
          </div>
        </a>
      </div>
    `
    )
    .join("");
}

renderProducts();
