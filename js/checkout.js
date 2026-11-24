const ORDERS_URL = "https://web-basics-api-gagashaggy.msk1.amvera.tech/labs/api/orders";

// Пункты списка в форме: [категория, подпись, текст для пустого пункта]
const SUMMARY_ROWS = [
	["soup", "Суп", "Не выбран"],
	["main", "Главное блюдо", "Не выбрано"],
	["salad", "Салат или стартер", "Не выбран"],
	["drink", "Напиток", "Не выбран"],
	["dessert", "Десерт", "Не выбран"]
];

// Поля API с id блюд
const ID_FIELDS = {
	soup: "soup_id",
	main: "main_course_id",
	salad: "salad_id",
	drink: "drink_id",
	dessert: "dessert_id"
};

const form = document.querySelector("form");
const selectedContainer = document.querySelector("[data-category=\"selected\"]");
const emptyText = document.getElementById("empty-order");
const summaryList = document.querySelector("#order-summary dl");
const totalText = document.getElementById("order-total");
const timeInput = document.getElementById("delivery-time");
const submitButton = form.querySelector("button[type=\"submit\"]");

/* Состав заказа и список в форме */

function renderCheckout() {
	const selected = getSelectedDishes();
	const chosen = CATEGORIES.map((category) => selected[category]).filter(Boolean);

	// Карточки выбранных блюд
	selectedContainer.replaceChildren();
	chosen.forEach((dish) => selectedContainer.append(createDishCard(dish, "Удалить")));
	emptyText.hidden = chosen.length > 0;

	// Список блюд с ценами в левой части формы
	summaryList.replaceChildren();
	SUMMARY_ROWS.forEach(([category, label, emptyLabel]) => {
		const dish = selected[category];
		const term = document.createElement("dt");
		const value = document.createElement("dd");

		term.textContent = label;
		if (dish) {
			value.textContent = `${dish.name} ${dish.price}₽`;
		} else {
			value.textContent = emptyLabel;
			value.dataset.empty = "";
		}

		summaryList.append(term, value);
	});

	// Итоговая стоимость
	totalText.hidden = chosen.length === 0;
	totalText.textContent = `Стоимость заказа: ${chosen.reduce((sum, dish) => sum + dish.price, 0)}₽`;
}

// Кнопка «Удалить» убирает блюдо из заказа и из localStorage
selectedContainer.addEventListener("click", (event) => {
	if (!event.target.closest("button")) return;

	const card = event.target.closest("[data-dish]");
	const dish = dishes.find((item) => item.keyword === card.dataset.dish);

	removeFromOrder(dish.category);
	renderCheckout();
});

/* Время доставки */

// Время нужно указывать только для доставки «к указанному времени»
function syncTime() {
	const byTime = form.elements.delivery_type.value === "by_time";
	timeInput.disabled = !byTime;
	timeInput.required = byTime;
	if (!byTime) timeInput.value = "";
}

form.addEventListener("change", syncTime);
form.addEventListener("reset", () => setTimeout(syncTime));
syncTime();

/* Отправка заказа */

async function sendOrder(data) {
	const response = await fetch(`${ORDERS_URL}?api_key=${API_KEY}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data)
	});

	const text = await response.text();
	let result = null;
	try {
		result = text ? JSON.parse(text) : null;
	} catch (error) {
		result = null;
	}

	if (!response.ok) {
		let message = (result && (result.error || result.message || result.detail)) || `Ошибка сервера: ${response.status}`;
		if (typeof message !== "string") message = JSON.stringify(message);
		throw new Error(message);
	}

	return result;
}

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	const selected = getSelectedDishes();
	const message = getComboMessage(selected);

	if (message !== null) {
		showNotification(message);
		return;
	}

	const data = {
		full_name: form.elements.full_name.value.trim(),
		email: form.elements.email.value.trim(),
		subscribe: form.elements.subscribe.checked ? 1 : 0,
		phone: form.elements.phone.value.trim(),
		delivery_address: form.elements.delivery_address.value.trim(),
		delivery_type: form.elements.delivery_type.value,
		comment: form.elements.comment.value.trim()
	};

	if (data.delivery_type === "by_time") {
		data.delivery_time = form.elements.delivery_time.value;
	}

	for (const category in ID_FIELDS) {
		if (selected[category]) data[ID_FIELDS[category]] = selected[category].id;
	}

	submitButton.disabled = true;

	try {
		await sendOrder(data);

		// Заказ оформлен — очищаем localStorage, список и форму
		clearOrder();
		renderCheckout();
		form.reset();
		showNotification("Заказ успешно оформлен!");
	} catch (error) {
		// При ошибке данные в localStorage остаются
		showNotification(`Не удалось оформить заказ: ${error.message}`);
	} finally {
		submitButton.disabled = false;
	}
});

/* Загрузка блюд */

loadDishes()
	.then(renderCheckout)
	.catch((error) => {
		console.error(error);
		showNotification("Не удалось загрузить блюда. Попробуйте обновить страницу.");
	});
