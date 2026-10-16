// Проверяет, что выбранные блюда образуют один из доступных комбо.
function getComboMessage() {
	const hasSoup = order.soup !== null;
	const hasMain = order.main !== null;
	const hasSalad = order.salad !== null;
	const hasDrink = order.drink !== null;
	const hasDessert = order.dessert !== null;

	if (!hasSoup && !hasMain && !hasSalad && !hasDrink && !hasDessert) {
		return "Ничего не выбрано. Выберите блюда для заказа";
	}
	if (!hasSoup && !hasMain && !hasSalad) {
		return "Выберите главное блюдо";
	}
	if (hasSoup && !hasMain && !hasSalad) {
		return "Выберите главное блюдо/салат/стартер";
	}
	if (hasSalad && !hasSoup && !hasMain) {
		return "Выберите суп или главное блюдо";
	}
	if (!hasDrink) {
		return "Выберите напиток";
	}
	return null;
}

// Динамически создаёт уведомление поверх страницы
function showNotification(text) {
	const old = document.getElementById("notification");
	if (old) old.remove();

	const box = document.createElement("div");
	box.id = "notification";

	const message = document.createElement("p");
	message.textContent = text;

	const button = document.createElement("button");
	button.type = "button";
	button.textContent = "Окей 👌";
	button.addEventListener("click", () => box.remove());

	box.append(message, button);
	document.body.append(box);
	button.focus();
}

// При отправке формы проверяем состав ланча
document.querySelector("form").addEventListener("submit", (event) => {
	const message = getComboMessage();

	if (message !== null) {
		event.preventDefault();
		showNotification(message);
	}
});