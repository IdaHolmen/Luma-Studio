// IMPORTS
import { fetchProducts, renderCards, hasCategory } from "./cards.js";
import { loadCartFromStorage } from "./cart.js";
import "./checkout.js";
import "./productPage.js";

loadCartFromStorage();
// FILTER
let allProducts = [];
let activeFilter = "all";

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function applyFilter(products) {
  if (activeFilter === "all") return products;

  return products.filter((p) => {
    const cats = Array.isArray(p.category) ? p.category : [p.category];
    return cats.map(normalize).includes(normalize(activeFilter));
  });
}

function setActiveButton(filterButtons, clickedBtn) {
  filterButtons.forEach((btn) => {
    btn.classList.remove("filter-button-active");
    btn.classList.add("filter-button");
  });

  clickedBtn.classList.add("filter-button-active");
  clickedBtn.classList.remove("filter-button");
}

document.addEventListener("DOMContentLoaded", async () => {
  const productsContainer = document.querySelector("#products");
  const bestsellersContainer = document.querySelector("#bestsellers");
  const filterButtons = document.querySelectorAll(".filter button");

  if (!productsContainer && !bestsellersContainer) return;

  try {
    allProducts = await fetchProducts();

    if (productsContainer) {
      const view = applyFilter(allProducts);
      renderCards(view, productsContainer);

      filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          activeFilter = btn.dataset.filter || "all";
          setActiveButton(filterButtons, btn);

          const nextView = applyFilter(allProducts);
          renderCards(nextView, productsContainer);
        });
      });
    }

    if (bestsellersContainer) {
      const bestsellers = allProducts.filter((p) => hasCategory(p, "bestselger"));
      renderCards(bestsellers.slice(0, 4), bestsellersContainer);
    }
  } catch (err) {
    console.error("Feil ved henting av produkter:", err);

    if (productsContainer) {
      const msg = document.createElement("div");
      msg.classList.add("error-message");
      msg.textContent = "Det har skjedd en feil. Vennligst prøv igjen.";
      productsContainer.append(msg);
    }
  }
});

// WHEN PAGE IS LOADED
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".page-link");
  const currentPath = window.location.pathname.split("/").pop();

  const toggle = document.getElementById("toggle");
  const holder = document.querySelector(".toggle-holder");

  // MAKING CURRENT PAGE LINK BOLD
  links.forEach((link) => {
    const linkPath = link.getAttribute("href").split("/").pop();

    if (linkPath === currentPath || (linkPath === "index.html" && currentPath === "")) {
      link.classList.add("active");
    }
  });

  if (!toggle) return;

  // CHANGING THE IMAGES ON TOGGLE
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
