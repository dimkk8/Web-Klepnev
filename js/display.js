// Создаёт DOM-элемент карточки блюда
function createDishCard(dish) {
	const card = document.createElement("div");
	card.dataset.dish = dish.keyword;

	const image = document.createElement("img");
	image.src = dish.image;
	image.alt = dish.name;

	const price = document.createElement("p");
	price.textContent = `${dish.price}₽`;

	const name = document.createElement("p");
	name.textContent = dish.name;

	const count = document.createElement("p");
	count.textContent = dish.count;

	const button = document.createElement("button");
	button.type = "button";
	button.textContent = "Добавить";

	card.append(image, price, name, count, button);
	return card;
}

// Выводит блюда одной категории (при указанном kind — только этого вида)
function displayCategory(category, kind = null) {
	const container = document.querySelector(`[data-category="${category}"]`);
	container.replaceChildren();

	dishes
		.filter((dish) => dish.category === category && (kind === null || dish.kind === kind))
		.forEach((dish) => container.append(createDishCard(dish)));
}

// Сортируем блюда по алфавиту и выводим каждую категорию в свою секцию
function displayDishes() {
	dishes.sort((a, b) => a.name.localeCompare(b.name, "ru"));

	document.querySelectorAll("[data-category]").forEach((container) => {
		displayCategory(container.dataset.category);
	});
}

displayDishes();