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

// Сортируем блюда по алфавиту и выводим каждое в свою секцию
function displayDishes() {
	dishes.sort((a, b) => a.name.localeCompare(b.name, "ru"));

	dishes.forEach((dish) => {
		const container = document.querySelector(`[data-category="${dish.category}"]`);
		container.append(createDishCard(dish));
	});
}

displayDishes();
