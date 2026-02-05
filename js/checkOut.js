//CHECKOUT
const checkoutMenuButton = document.querySelector("#cart");
const checkoutMenu = document.querySelector(".checkout-container");
const crossOutMenuButton = document.querySelector(".exit-icon");
const headerContainer = document.querySelector(".header");

//When shopping-bag-icon is clicked the checkout is displayed and background is blurred
const toggleCheckout = () => {
  checkoutMenu.classList.toggle("is-open");
};
checkoutMenuButton.addEventListener("click", toggleCheckout);
crossOutMenuButton.addEventListener("click", toggleCheckout);

// ADD CONTENT TO CHECKOUT

const addContent = () => {
  const cartButtons = document.querySelectorAll(".purchase-button");
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
