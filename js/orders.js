const ORDERS_URL = "https://web-basics-api-gagashaggy.msk1.amvera.tech/labs/api/orders";

// Поля заказа с блюдами: [поле в API, подпись]
const ORDER_FIELDS = [
	["soup_id", "Суп"],
	["main_course_id", "Основное блюдо"],
	["salad_id", "Салат"],
	["drink_id", "Напиток"],
	["dessert_id", "Десерт"]
];

const ICONS = {
	view: '<circle cx="12" cy="12" r="3"/><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>',
	edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
	remove: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'
};

let orders = [];
let toastTimer;

const ordersBody = document.getElementById("orders-body");
const ordersEmpty = document.getElementById("orders-empty");
const modal = document.getElementById("modal");
const modalForm = document.getElementById("modal-form");
const toast = document.getElementById("toast");

/* Вспомогательные функции */

// Создаёт DOM-элемент: el("p", { textContent: "..." }, потомки...)
function el(tag, props = {}, ...children) {
	const node = document.createElement(tag);
	Object.assign(node, props);
	node.append(...children);
	return node;
}

// Запрос к API: добавляет api_key, разбирает ответ и ошибки
async function request(url, options = {}) {
	const response = await fetch(`${url}?api_key=${API_KEY}`, options);
	const text = await response.text();

	let data = null;
	try {
		data = text ? JSON.parse(text) : null;
	} catch (error) {
		data = null;
	}

	if (!response.ok) {
		let message = (data && (data.error || data.message || data.detail)) || `Ошибка сервера: ${response.status}`;
		if (typeof message !== "string") message = JSON.stringify(message);
		throw new Error(message);
	}

	return data;
}

function showToast(text, isError = false) {
	clearTimeout(toastTimer);
	toast.textContent = text;
	toast.dataset.type = isError ? "error" : "success";

	if (toast.matches(":popover-open")) toast.hidePopover();
	toast.showPopover();

	toastTimer = setTimeout(() => {
		if (toast.matches(":popover-open")) toast.hidePopover();
	}, 4000);
}

function pad(number) {
	return String(number).padStart(2, "0");
}

function formatDate(value) {
	// API присылает created_at без часового пояса (например, "2026-11-15T08:42:12.7"),
	// но это время в UTC. Без "Z" браузер считает его локальным и показывает как есть.
	let normalized = value;
	if (typeof value === "string") {
		const hasTimeZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value.trim());
		if (!hasTimeZone) normalized = `${value.trim().replace(" ", "T")}Z`;
	}

	const date = new Date(normalized);
	if (Number.isNaN(date.getTime())) return value;

	const formatter = new Intl.DateTimeFormat("ru-RU", {
		timeZone: "Europe/Moscow",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	});

	return formatter.format(date).replace(",", " ");
}

function deliveryText(order) {
	if (order.delivery_type === "by_time" && order.delivery_time) {
		return order.delivery_time.slice(0, 5);
	}
	return "Как можно скорее (с 7:00 до 23:00)";
}

// Блюда заказа: [{ label, dish }]
function getOrderDishes(order) {
	const result = [];
	ORDER_FIELDS.forEach(([field, label]) => {
		const id = order[field];
		if (id === null || id === undefined) return;

		const dish = dishes.find((item) => item.id === id);
		if (dish) result.push({ label, dish });
	});
	return result;
}

function getTotal(items) {
	return items.reduce((sum, item) => sum + item.dish.price, 0);
}

/* Список заказов */

function iconButton(title, icon, handler) {
	const button = el("button", { type: "button", title });
	button.setAttribute("aria-label", title);
	button.innerHTML = `<svg viewBox="0 0 24 24">${icon}</svg>`;
	button.addEventListener("click", handler);
	return button;
}

function renderOrders() {
	// Сначала новые заказы
	orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

	ordersBody.replaceChildren();
	ordersEmpty.hidden = orders.length > 0;

	orders.forEach((order, index) => {
		const items = getOrderDishes(order);

		const row = el("tr", {},
			el("td", { textContent: index + 1 }),
			el("td", { textContent: formatDate(order.created_at) }),
			el("td", { textContent: items.map((item) => item.dish.name).join(", ") }),
			el("td", { textContent: `${getTotal(items)}₽` }),
			el("td", { textContent: deliveryText(order) }),
			el("td", {},
				iconButton("Подробнее", ICONS.view, () => showOrder(order)),
				iconButton("Редактирование", ICONS.edit, () => editOrder(order)),
				iconButton("Удаление", ICONS.remove, () => deleteOrder(order))
			)
		);

		ordersBody.append(row);
	});
}

/* Модальное окно */

// buttons: [[подпись, "button" | "submit"]]; submit вызывает onSubmit
function openModal(mode, title, body, buttons, onSubmit) {
	modal.dataset.mode = mode;

	const closeButton = el("button", { type: "button", textContent: "×" });
	closeButton.setAttribute("aria-label", "Закрыть");
	closeButton.addEventListener("click", () => modal.close());

	const footer = el("div");
	buttons.forEach(([label, type]) => {
		const button = el("button", { type, textContent: label });
		if (type === "button") button.addEventListener("click", () => modal.close());
		footer.append(button);
	});

	modalForm.onsubmit = (event) => {
		event.preventDefault();
		if (onSubmit) onSubmit();
	};

	modalForm.replaceChildren(
		el("div", {}, el("h2", { textContent: title }), closeButton),
		el("div", {}, ...body),
		footer
	);

	modal.showModal();
}

// Клик по затемнению закрывает окно
modal.addEventListener("click", (event) => {
	if (event.target === modal) modal.close();
});

// Список «название — значение»
function infoList(pairs) {
	const list = el("dl");
	pairs.forEach(([key, value]) => {
		list.append(el("dt", {}, key), el("dd", {}, value));
	});
	return list;
}

function compositionBlock(order) {
	const items = getOrderDishes(order);
	return [
		el("h3", { textContent: "Состав заказа" }),
		infoList(items.map(({ label, dish }) => [label, `${dish.name} (${dish.price}₽)`])),
		el("h3", { textContent: `Стоимость: ${getTotal(items)}₽` })
	];
}

/* Подробнее */

function showOrder(order) {
	openModal("view", "Просмотр заказа", [
		infoList([["Дата оформления", formatDate(order.created_at)]]),
		el("h3", { textContent: "Доставка" }),
		infoList([
			["Имя получателя", order.full_name],
			["Адрес доставки", order.delivery_address],
			["Время доставки", deliveryText(order)],
			["Телефон", order.phone],
			["Email", order.email]
		]),
		el("h3", { textContent: "Комментарий" }),
		el("p", { textContent: order.comment || "—" }),
		...compositionBlock(order)
	], [["ОК", "button"]]);
}

/* Редактирование */

function editOrder(order) {
	const fullName = el("input", { id: "edit-full-name", type: "text", required: true, value: order.full_name || "" });
	const address = el("input", { id: "edit-address", type: "text", required: true, value: order.delivery_address || "" });
	const type = el("select", { id: "edit-type" },
		el("option", { value: "now", textContent: "Как можно скорее" }),
		el("option", { value: "by_time", textContent: "Ко времени" })
	);
	type.value = order.delivery_type;
	const time = el("input", {
		id: "edit-time", type: "time", min: "07:00", max: "23:00", step: 300,
		value: order.delivery_time ? order.delivery_time.slice(0, 5) : ""
	});
	const phone = el("input", { id: "edit-phone", type: "tel", required: true, value: order.phone || "" });
	const email = el("input", { id: "edit-email", type: "email", required: true, value: order.email || "" });
	const comment = el("textarea", { id: "edit-comment", rows: 3, value: order.comment || "" });

	// Время доступно только для доставки «ко времени»
	function syncTime() {
		const byTime = type.value === "by_time";
		time.disabled = !byTime;
		time.required = byTime;
	}
	type.addEventListener("change", syncTime);
	syncTime();

	const label = (text, input) => [el("label", { textContent: text, htmlFor: input.id }), input];

	openModal("edit", "Редактирование заказа", [
		infoList([["Дата оформления", formatDate(order.created_at)]]),
		el("h3", { textContent: "Доставка" }),
		infoList([
			label("Имя получателя", fullName),
			label("Адрес доставки", address),
			label("Тип доставки", type),
			label("Время доставки", time),
			label("Телефон", phone),
			label("Email", email)
		]),
		el("h3", { textContent: "Комментарий" }),
		comment,
		...compositionBlock(order)
	], [["Отмена", "button"], ["Сохранить", "submit"]], async () => {
		const values = {
			full_name: fullName.value.trim(),
			delivery_address: address.value.trim(),
			delivery_type: type.value,
			phone: phone.value.trim(),
			email: email.value.trim(),
			comment: comment.value.trim()
		};
		if (values.delivery_type === "by_time") values.delivery_time = time.value;

		// Отправляем только изменившиеся поля
		const changes = {};
		for (const key in values) {
			const original = key === "delivery_time" ? (order.delivery_time || "").slice(0, 5) : (order[key] ?? "");
			if (values[key] !== original) changes[key] = values[key];
		}

		if (Object.keys(changes).length === 0) {
			modal.close();
			showToast("Изменений нет");
			return;
		}

		try {
			const updated = await request(`${ORDERS_URL}/${order.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(changes)
			});

			const index = orders.findIndex((item) => item.id === order.id);
			orders[index] = updated;

			modal.close();
			renderOrders();
			showToast("Заказ успешно изменён");
		} catch (error) {
			showToast(`Не удалось изменить заказ: ${error.message}`, true);
		}
	});
}

/* Удаление */

function deleteOrder(order) {
	// Номер заказа в таблице (orders уже отсортирован в renderOrders)
	const number = orders.findIndex((item) => item.id === order.id) + 1;

	openModal("delete", "Удаление заказа", [
		el("p", { textContent: `Вы уверены, что хотите удалить заказ №${number}?` }),
		infoList([["Дата оформления", formatDate(order.created_at)]])
	], [["Отмена", "button"], ["Да", "submit"]], async () => {
		try {
			await request(`${ORDERS_URL}/${order.id}`, { method: "DELETE" });

			orders = orders.filter((item) => item.id !== order.id);

			modal.close();
			renderOrders();
			showToast("Заказ успешно удалён");
		} catch (error) {
			showToast(`Не удалось удалить заказ: ${error.message}`, true);
		}
	});
}

/* Загрузка данных */

Promise.all([loadDishes(), request(ORDERS_URL)])
	.then(([, data]) => {
		orders = data;
		renderOrders();
	})
	.catch((error) => {
		console.error(error);
		showToast(`Не удалось загрузить заказы: ${error.message}`, true);
	});
