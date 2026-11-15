// Выводит блюда одной категории (при указанном kind — только этого вида)
function displayCategory(category, kind = null) {
	const container = document.querySelector(`[data-category="${category}"]`);
	container.replaceChildren();

	dishes
		.filter((dish) => dish.category === category && (kind === null || dish.kind === kind))
		.forEach((dish) => {
			const card = createDishCard(dish);
			if (isSelected(dish)) card.dataset.selected = "";
			container.append(card);
		});
}

// Сортируем блюда по алфавиту и выводим каждую категорию в свою секцию
function displayDishes() {
	dishes.sort((a, b) => a.name.localeCompare(b.name, "ru"));

	document.querySelectorAll("[data-category]").forEach((container) => {
		displayCategory(container.dataset.category);
	});
}

// Сначала загружаем блюда с сервера, затем сортируем и выводим на страницу
const dishesReady = loadDishes()
	.then(displayDishes)
	.catch((error) => {
		console.error(error);
		showNotification("Не удалось загрузить блюда. Попробуйте обновить страницу.");
	});
