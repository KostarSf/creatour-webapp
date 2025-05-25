const USER_ROLES = {
	user: { key: "user", title: "Пользователь" },
	creator: { key: "creator", title: "Разработчик турпродуктов" },
	placeowner: { key: "placeowner", title: "Владелец ресурсов" },
	admin: { key: "admin", title: "Администратор" },
} as const;

const USER_ROLES_LIST = Object.values(USER_ROLES);

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]["key"];

export { USER_ROLES, USER_ROLES_LIST };
