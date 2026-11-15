// Создаёт DOM-элемент карточки блюда (одинаковый на страницах «Собрать ланч» и «Оформить заказ»)
function createDishCard(dish, buttonText = "Добавить") {
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
	button.textContent = buttonText;

	card.append(image, price, name, count, button);
	return card;
}
