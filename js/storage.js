// В localStorage хранятся только идентификаторы выбранных блюд.
// Формат: { "soup": 3, "main": 7, "drink": 12 } — категория: id блюда
const ORDER_KEY = "order";
const CATEGORIES = ["soup", "main", "salad", "drink", "dessert"];

function getOrderIds() {
	try {
		const ids = JSON.parse(localStorage.getItem(ORDER_KEY));
		return ids && typeof ids === "object" ? ids : {};
	} catch (error) {
		return {};
	}
}

function saveOrderIds(ids) {
	localStorage.setItem(ORDER_KEY, JSON.stringify(ids));
}

// Блюдо заменяет ранее выбранное в этой же категории
function addToOrder(dish) {
	const ids = getOrderIds();
	ids[dish.category] = dish.id;
	saveOrderIds(ids);
}

function removeFromOrder(category) {
	const ids = getOrderIds();
	delete ids[category];
	saveOrderIds(ids);
}

function clearOrder() {
	localStorage.removeItem(ORDER_KEY);
}

function isSelected(dish) {
	return dish.id !== undefined && getOrderIds()[dish.category] === dish.id;
}

// Выбранные блюда по категориям: { soup: {...} | null, ... }
function getSelectedDishes() {
	const ids = getOrderIds();
	const selected = {};

	CATEGORIES.forEach((category) => {
		selected[category] = dishes.find((dish) => dish.category === category && dish.id === ids[category]) || null;
	});

	return selected;
}
