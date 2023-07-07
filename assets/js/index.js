window.onload = function () {
	const _ = document;

	let flippedCard = 0,
		firstCard,
		secondCard,
		moveCount = 0,
		cardsCount = 16,
		timer,
		seconds = 0;

	const movesElement = _.querySelector(".game-stats__moves-count"),
		startBtn = _.querySelector(".game-stats__start"),
		cardsContainer = _.querySelector(".game-body__cards"),
		winAreaContainer = _.querySelector(".game-body__win-wrapper"),
		secondsElement = _.querySelector(".game-stats__time-tick");

	_.querySelectorAll(".grids__grid").forEach((gridElem) =>
		gridElem.addEventListener("click", selectGird)
	);

	function selectGird() {
		const imagesNumber = parseInt(this.dataset.gridNumber) / 2;

		cardsContainer.setAttribute("data-grid", this.dataset.grid);
		fetchImages(imagesNumber).then((images) => {
			shuffleImages(images);
		});
	}

	async function fetchImages(imagesNumber = 8) {
		try {
			const response = await fetch(
				`https://picsum.photos/v2/list?limit=${imagesNumber}`
			);

			if (response.status === 200 && response.ok) {
				return response.json();
			}
		} catch (e) {
			console.log(e);
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
		// Animation default duration
		let duration = 1000;
		const template = _.createElement("template");

		images.forEach((image) => {
			template.innerHTML += `
        <div onclick="notifyUser()" class="${
					window.innerWidth > 768 ? "fadeInTopRight" : ""
				} cards__card" data-duration="${(duration += 50)}" data-card="${
				image.id
			}">
            <div class="card__face">
                <img src="${image.url}" alt="Card Image">
            </div>
            <div class="card__back"></div>
        </div>`;
		});

		appendCardsIntoDom(template.content);

		winAreaContainer.classList.add("hidden");
		cardsContainer.classList.remove("hidden");

		hideGridSelection();
	}

	function appendCardsIntoDom(cardsFragment) {
		cardsContainer.innerHTML = "";

		cardsContainer.append(cardsFragment);
		startBtn.addEventListener("click", startGame);
	}

	function startGame() {
		addEventToCards();

		timer = setInterval(() => {
			seconds++;
			secondsElement.textContent = `${seconds} ${
				seconds === 0 || seconds === 1 ? "sec" : "secs"
			}`;
		}, 1000);

		this.removeEventListener("click", startGame);
		this.addEventListener("click", restartGame);
		startBtn.textContent = "Restart";
	}

	function restartGame() {
		showGridSelection();
		this.removeEventListener("click", restartGame);

		startBtn.textContent = "Start";

		movesElement.textContent = 0;
		secondsElement.textContent = 0;

		moveCount = 0;
		resetStats();
	}

	function resetStats() {
		clearInterval(timer);

		flippedCard = 0;
		seconds = 0;
	}

	function addEventToCards() {
		const cards = _.querySelectorAll(".cards__card:not(.flipped)");

		cards.forEach((card) => {
			card.removeAttribute("onclick");
			card.addEventListener("click", flipTheCard);
		});
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

	window.notifyUser = function () {
		startBtn.focus();
	};

	function removeCardsEvent() {
		const cards = _.querySelectorAll(".cards__card");

		cards.forEach((card) => card.removeEventListener("click", flipTheCard));
	}

	function hideGridSelection() {
		const selectGridContainer = _.querySelector(".app__select-grid");

		selectGridContainer.classList.add("hidden");
	}

	function showGridSelection() {
		const selectGridContainer = _.querySelector(".app__select-grid");

		selectGridContainer.classList.remove("hidden");
	}

	function checkPlayerState() {
		const flippedCardsLength = _.querySelectorAll(
			".cards__card.flipped"
		).length;

		if (flippedCardsLength === cardsCount) {
			winAreaContainer.querySelector("#time").textContent = seconds;
			winAreaContainer.querySelector("#moves").textContent = moveCount;

			setTimeout(() => {
				winAreaContainer.classList.remove("hidden");
				cardsContainer.classList.add("hidden");
			}, 800);

			resetStats();
		}
	}
};
