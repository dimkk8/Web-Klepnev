// Фильтры блюд: клик по кнопке показывает только блюда этого вида,
// повторный клик по той же кнопке снимает фильтр
document.querySelectorAll("[data-filters]").forEach((group) => {
	const category = group.dataset.filters;
	let activeKind = null;

	group.addEventListener("click", (event) => {
		const button = event.target.closest("button[data-kind]");
		if (!button) return;

		activeKind = activeKind === button.dataset.kind ? null : button.dataset.kind;

		group.querySelectorAll("button").forEach((item) => {
			item.setAttribute("aria-pressed", String(item.dataset.kind === activeKind));
		});

		displayCategory(category, activeKind);
	});
});