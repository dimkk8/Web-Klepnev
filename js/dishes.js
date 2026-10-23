const API_URL = "https://web-basics-api-gagashaggy.msk1.amvera.tech/labs/api/dishes/my";
const API_KEY = "4a54d08e-da5d-317d-8d91-c486ff7e318f";

// Если API называет категорию иначе, чем data-category в lunch.html
const categoryAliases = {
	"main-course": "main"
};

// Массив блюд заполняется после ответа сервера
let dishes = [];

async function loadDishes() {
	const response = await fetch(`${API_URL}?api_key=${API_KEY}`);

	if (!response.ok) {
		throw new Error(`Сервер вернул ошибку: ${response.status}`);
	}

	const data = await response.json();

	dishes = data.map((dish) => ({
		...dish,
		category: categoryAliases[dish.category] || dish.category
	}));
}