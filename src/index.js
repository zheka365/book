import "./styles/main.css";
import { initSlider } from "./components/initSlider";
import switchToNextSlide from "./components/autoMoveSlider";

document.addEventListener("DOMContentLoaded", () => {
  initSlider();
  switchToNextSlide();

  const categoriesLink = document.querySelectorAll(".categories_link");
  const cardsBlock = document.querySelector(".cards_block");
  const loadBtn = document.querySelector(".load_btn");
  const cartCounter = document.querySelector(".cart_counter"); 


  const CART_KEY = "cart";


  // Получаем корзину из LocalStorage
  function getCart() {
    const cartString = localStorage.getItem(CART_KEY);
    return cartString ? JSON.parse(cartString) : {}; 
  }

  // Сохраняем корзину в LocalStorage
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  // Инициализация корзины при загрузке страницы
  const initialCart = getCart();

  // Данные
  const appState = {
    activeCategoryIndex: localStorage.getItem("activeCategoryIndex")
      ? parseInt(localStorage.getItem("activeCategoryIndex"), 10)
      : 0,
    startIndex: 0,
    cartItems: initialCart, 
    cartCount: Object.keys(initialCart).length, 
    params: new URLSearchParams({
      key: "AIzaSyAersGrpFzMRiU9ntCg4mdgDGPQFrULqOI",
      printType: "books",
      maxResults: "6",
      langRestrict: "en",
    }),
  };

  // Функция для получения текущей активной категории
  const getActiveCategory = () => {
    const activeLink = document.querySelector(".categories_link.active");
    return activeLink ? activeLink.dataset.category : null;
  };

  // Функция для создания URL запроса
  const createRequestUrl = (params) => {
    const category = getActiveCategory();
    if (!category) {
      console.error("Нет активной категории для запроса");
      return null;
    }
    const localParams = new URLSearchParams(params);
    localParams.set("q", `subject:${category}`);
    return `https://www.googleapis.com/books/v1/volumes?${localParams.toString()}`;
  };

  // Функция для запроса
  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка fetch:", error);
      return null;
    }
  };

  // Функция для обработки книг
  const displayBooks = (books) => {
    if (!cardsBlock) {
      console.error("Не найден элемент .cards_block");
      return;
    }
    if (!books) {
      cardsBlock.innerHTML += `<p>No books found</p>`;
      return;
    }
    books.forEach((book) => {
      const authors = book.volumeInfo.authors
        ? book.volumeInfo.authors.join(", ")
        : "Unknown";
      const thumbnail = book.volumeInfo.imageLinks?.thumbnail || "";
      const title = book.volumeInfo.title || "Unknown";
      const description = book.volumeInfo.description || "No description";
      const price = book.saleInfo?.retailPrice
        ? book.saleInfo.retailPrice.amount +
          " " +
          book.saleInfo.retailPrice.currencyCode
        : "Unavailable";
      const averageRating = Math.floor(Math.random() * 5) + 1;
      const ratingsCount = Math.floor(Math.random() * 1000);
      let ratingStars = "";
      for (let i = 1; i <= 5; i++) {
        if (i <= averageRating) {
          ratingStars += `<svg class="raiting_star"><use xlink:href="#star-active" /></svg>`;
        } else {
          ratingStars += `<svg class="raiting_star"><use xlink:href="#star-inactive" /></svg>`;
        }
      }
      const card = document.createElement("div");
      card.classList.add("cards_item", "book_card");
      card.setAttribute("data-book-id", book.id);

      // Проверяем, есть ли книга в корзине и устанавливаем текст кнопки
      const isInCart = appState.cartItems[book.id];
      const buttonText = isInCart ? "Delete from cart" : "Buy now";
      const buttonClass = isInCart ? "info_btn active" : "info_btn";

      card.innerHTML = `<img src=${thumbnail} alt="book cover" class="card_img">
            <div class="card_info">
                 <div class="info_author">${authors}</div>
                 <div class="info_title">${title}</div>
                  <div class="info_raiting">
                    <div>${ratingStars}</div>
                    ${ratingsCount} review
                  </div>
                  <p class="info_text">${description}</p>
                   <div class="info_cost">${price}</div>
                    <button class="${buttonClass}" data-book-id="${book.id}">${buttonText}</button>
                </div>`;
      cardsBlock.appendChild(card);
    });
    activateBtns();
  };

  const setActiveCategory = () => {
    if (!categoriesLink || categoriesLink.length === 0) {
      console.error("Не найдены элементы категорий (categoriesLink)");
      return;
    }
    categoriesLink.forEach((link, index) => {
      link.classList.toggle("active", index === appState.activeCategoryIndex);
    });
  };

  const loadBooks = async () => {
    const url = createRequestUrl(appState.params);
    if (!url) return;
    const data = await fetchData(url);
    if (data && data.items) {
      displayBooks(data.items);
    }
  };

  const handleCategoryClick = (index) => {
    categoriesLink.forEach((link) => link.classList.remove("active"));
    categoriesLink[index].classList.add("active");
    appState.activeCategoryIndex = index;
    localStorage.setItem("activeCategoryIndex", appState.activeCategoryIndex);
    cardsBlock.innerHTML = "";
    appState.startIndex = 0;
    appState.params.set("startIndex", appState.startIndex);
    loadBooks();
  };
  const handleLoadMoreClick = () => {
    appState.startIndex += 6;
    appState.params.set("startIndex", appState.startIndex);
    loadBooks();
  };

  const toggleCartItem = (btn, card, bookId, cartCounter) => {
    if (!appState.cartItems[bookId]) {
      appState.cartItems[bookId] = true;
      appState.cartCount++;
      btn.textContent = "Delete from cart";
      btn.classList.add("active");
    } else {
      delete appState.cartItems[bookId];
      appState.cartCount--;
      btn.textContent = "Buy now";
      btn.classList.remove("active");
    }
    // Сохраняем корзину в LocalStorage
    saveCart(appState.cartItems);
    updateCartCounter();
  };

  const updateCartCounter = () => {
    cartCounter.textContent = appState.cartCount;
    cartCounter.style.display = appState.cartCount > 0 ? "block" : "none";
  };

  const activateBtns = () => {
    const cards = document.querySelectorAll(".cards_item");
    if (cards && cards.length > 0) {
      cards.forEach((card) => {
        const btn = card.querySelector(".info_btn");
        const bookId = card.dataset.bookId;

        if (btn) {
          btn.addEventListener("click", (event) => {
            event.stopPropagation();
            toggleCartItem(btn, card, bookId, cartCounter);
          });
          // Обновляем текст и класс кнопки в зависимости от состояния корзины
          if (appState.cartItems[bookId]) {
            btn.textContent = "Delete from cart";
            btn.classList.add("active");
          } else {
            btn.textContent = "Buy now";
            btn.classList.remove("active");
          }
        }
      });
    }
  };

  const initialLoad = async () => {
    setActiveCategory();
    updateCartCounter();
    await loadBooks();
  };

  initialLoad();
  categoriesLink.forEach((link, index) => {
    link.addEventListener("click", () => handleCategoryClick(index));
  });

  loadBtn.addEventListener("click", handleLoadMoreClick);

  const cardsBlockElement = document.querySelector(".cards_block"); 

if (cardsBlockElement) { 
    cardsBlockElement.addEventListener("click", function(event) {
        if (event.target.classList.contains("info_btn")) {
            const btn = event.target;
            const card = btn.closest(".cards_item"); 
            const bookId = card.dataset.bookId;
            toggleCartItem(btn, card, bookId, cartCounter);
        }
    });
} else {
    console.error("Element with class 'cards_block' not found");
}

});