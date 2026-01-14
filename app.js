// Active color for search field
const searchField = document.querySelector(".search-field");

const addActiveClass = () => {
  searchField.classList.add("search-field--active");
};

const removeActiveClass = () => {
  searchField.classList.remove("search-field--active");
};

searchField.addEventListener("focus", addActiveClass);
searchField.addEventListener("blur", removeActiveClass);

// For searching through the books

const searchLamps = () => {
  const input = searchField.value.toLowerCase();
  const lampContainers = document.querySelectorAll(".lamp__container");

  for (let i = 0; i < lampContainers.length; i++) {
    const titleElement = lampContainers[i].querySelector(".lamp__title");
    const authorElement = lampContainers[i].querySelector(".lamp__author");

    const title = titleElement ? titleElement.innerText.toLowerCase() : "";
    const author = authorElement ? authorElement.innerText.toLowerCase() : "";

    if (title.includes(input) || author.includes(input)) {
      lampContainers[i].style.display = "";
    } else {
      lampContainers[i].style.display = "none";
    }
  }
};

//So that you can search with enter button
searchField.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchLamps();
  }
});

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
