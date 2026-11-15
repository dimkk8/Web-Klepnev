const API_URL = "https://web-basics-api-gagashaggy.msk1.amvera.tech/labs/api/dishes/my";
const API_KEY = "076c4eb3-bb97-31be-ad9b-b68f1366b031";

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