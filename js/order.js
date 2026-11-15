// Страница «Собрать ланч»: выбор блюд, подсветка и панель перехода к оформлению
const orderPanel = document.getElementById("order-panel");
const orderTotal = document.getElementById("order-total");
const checkoutLink = document.getElementById("checkout-link");

// Подсвечивает выбранные блюда в меню
function updateSelection() {
	document.querySelectorAll("[data-dish]").forEach((card) => {
		const dish = dishes.find((item) => item.keyword === card.dataset.dish);

		if (dish && isSelected(dish)) {
			card.dataset.selected = "";
		} else {
			delete card.dataset.selected;
		}
	});
}

// Показывает стоимость и включает ссылку, только если собран комбо
function updatePanel() {
	const selected = getSelectedDishes();
	const chosen = CATEGORIES.map((category) => selected[category]).filter(Boolean);

	orderPanel.hidden = chosen.length === 0;
	orderTotal.textContent = `${chosen.reduce((sum, dish) => sum + dish.price, 0)}₽`;

	if (getComboMessage(selected) === null) {
		checkoutLink.setAttribute("href", "checkout.html");
		checkoutLink.removeAttribute("aria-disabled");
	} else {
		checkoutLink.removeAttribute("href");
		checkoutLink.setAttribute("aria-disabled", "true");
	}
}

// Клик по карточке — сохраняем id блюда в localStorage
document.querySelectorAll("[data-category]").forEach((container) => {
	container.addEventListener("click", (event) => {
		const card = event.target.closest("[data-dish]");
		if (!card) return;

		const dish = dishes.find((item) => item.keyword === card.dataset.dish);
		addToOrder(dish);
		updateSelection();
		updatePanel();
	});
});

// После загрузки блюд учитываем заказ, сохранённый ранее
dishesReady.then(updatePanel);
