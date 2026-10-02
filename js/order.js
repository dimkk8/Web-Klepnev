// Выбранные блюда по категориям
const order = {
	soup: null,
	main: null,
	drink: null
};

// Сообщения для пустых категорий
const emptyMessages = {
	soup: "Блюдо не выбрано",
	main: "Блюдо не выбрано",
	drink: "Напиток не выбран"
};

const nothingSelected = document.getElementById("nothing-selected");
const orderTotal = document.getElementById("order-total");
const form = document.querySelector("form");

// Обновляет раздел «Ваш заказ» в форме
function updateOrder() {
	let total = 0;

	for (const category in order) {
		const dish = order[category];
		const block = document.getElementById(`order-${category}`);
		const text = block.querySelectorAll("p")[1];
		const field = block.querySelector("input");

		if (dish) {
			text.textContent = `${dish.name} ${dish.price}₽`;
			field.value = dish.keyword;
			total += dish.price;
		} else {
			text.textContent = emptyMessages[category];
			field.value = "";
		}
	}

	const isEmpty = Object.values(order).every((dish) => dish === null);

	nothingSelected.hidden = !isEmpty;
	orderTotal.hidden = isEmpty;
	for (const category in order) {
		document.getElementById(`order-${category}`).hidden = isEmpty;
	}

	orderTotal.querySelectorAll("p")[1].textContent = `${total}₽`;
}

// Клик по карточке — ищем блюдо в массиве по data-dish
document.querySelectorAll("[data-category]").forEach((container) => {
	container.addEventListener("click", (event) => {
		const card = event.target.closest("[data-dish]");
		if (!card) return;

		const dish = dishes.find((item) => item.keyword === card.dataset.dish);
		order[dish.category] = dish;
		updateOrder();
	});
});

// Кнопка «Сбросить» очищает и выбранные блюда
form.addEventListener("reset", () => {
	for (const category in order) {
		order[category] = null;
	}
	updateOrder();
});

updateOrder();
