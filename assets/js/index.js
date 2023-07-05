window.onload = function () {
  fetchImages();

  let flippedCard = 0,
    firstCard,
    secondCard,
    moveCount = 0,
    cardsCount = 16,
    timer;

  const movesElement = document.querySelector(".game-stats__moves-count");
  const startBtn = document.querySelector(".game-stats__start");

  function addEventToCards() {
    const cards = document.querySelectorAll(".cards__card:not(.flipped)");

    cards.forEach((card) => card.addEventListener("click", flipTheCard));
  }

  function removeCardsEvent() {
    const cards = document.querySelectorAll(".cards__card");

    cards.forEach((card) => card.removeEventListener("click", flipTheCard));
  }

  function startGame() {
    let secondsElement = document.querySelector(".game-stats__time-tick");
    let seconds = 0;

    addEventToCards();
    timer = setInterval(() => {
      seconds++;
      secondsElement.textContent = `${seconds} ${
        seconds === 0 || seconds === 1 ? "sec" : "secs"
      }`;
    }, 1000);
  }

  async function fetchImages() {
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const response = await fetch("https://picsum.photos/v2/list?limit=8", {
        signal,
      });

      if (response.status === 200 && response.ok) {
        const images = await response.json();
        shuffleImages(images);
      }
    } catch (e) {
      console.log(e);
    } finally {
      controller.abort();
    }
  }

  function shuffleImages(images = []) {
    const shuffled = shuffleArray(
      [...images, ...images].map((image) => ({
        url: image.download_url,
        id: image.id,
      }))
    );

    createCardsWithImages(shuffled);
  }

  function shuffleArray(arr = []) {
    return arr
      .map((item) => ({ item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ item }) => item);
  }

  function createCardsWithImages(images = []) {
    const template = document.createElement("template");

    images.forEach((image) => {
      template.innerHTML += `
        <div class="cards__card" data-card="${image.id}">
            <div class="card__face">
                <img src="${image.url}" alt="Card Image">
            </div>
            <div class="card__back"></div>
        </div>`;
    });

    appendCardsIntoDom(template.content);
  }

  function appendCardsIntoDom(cardsFragment) {
    const cardsContainer = document.querySelector(".game-body__cards");

    cardsContainer.append(cardsFragment);
    
    startBtn.addEventListener("click", startGame);
  }

  function flipTheCard(e) {
    let card = e.target.closest(".cards__card");

    card.classList.add("flipped");
    flippedCard++;
    moveCount++;

    if (flippedCard === 1) {
      firstCard = card;
    } else if (flippedCard === 2) {
      secondCard = card;

      removeCardsEvent();

      if (firstCard.dataset.card !== secondCard.dataset.card) {
        setTimeout(() => {
          firstCard.classList.remove("flipped");
          secondCard.classList.remove("flipped");

          addEventToCards();
        }, 1000);
      } else {
        addEventToCards();
        checkPlayerState();
      }

      flippedCard = 0;
    }

    movesElement.textContent = moveCount;
  }

  function checkPlayerState() {
    const flippedCardsLength = document.querySelectorAll(
      ".cards__card.flipped"
    ).length;

    if (flippedCardsLength === cardsCount) {
      clearInterval(timer);
      moveCount = 0;
      flippedCard = 0;
    }
  }
};
