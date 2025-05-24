const PRODUCT_TYPES = {
	excursion: { key: "excursion", title: "Экскурсия" },
	tour: { key: "tour", title: "Тур" },
	quest: { key: "quest", title: "Мероприятие" },
	event: { key: "event", title: "Событие" },
	masterclass: { key: "masterclass", title: "Мастер-класс" },
	gastroTour: { key: "gastroTour", title: "Гастро-тур" },
	exhibition: { key: "exhibition", title: "Выставка" },
	tournament: { key: "tournament", title: "Турнир" },
	lecture: { key: "lecture", title: "Лекция" },
};

const PRODUCT_TYPES_LIST = Object.values(PRODUCT_TYPES);

export { PRODUCT_TYPES, PRODUCT_TYPES_LIST };
