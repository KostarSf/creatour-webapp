import type { useLoaderData } from "react-router";
import { type UIMatch, useMatches } from "react-router";

/**
 * Позволяет конструировать глобальное меню навигации.
 *
 * @example
 * Добавьте `handle` с типом `BreadcrumbHandle` в файл нужного роута и задайте данные навигации
 * через поле `breadcrumb`:
 * ```ts
 * export const handle: BreadcrumbHandle = {
 *   breadcrumb: [
 *     { label: "Список заявок", href: config.routes.ORDERS_LIST },
 *     { label: "Создать заявку" }
 *   ],
 * };
 * ```
 *
 * Если необходимо использовать данные из лоадера, используйте колбек. Дополните дженерик аргумент
 * в `BreadcrumbHandle` для типизации данных:
 * ```ts
 * export const handle: BreadcrumbHandle<typeof loader> = {
 *    breadcrumb: (data) => [
 *      { label: "Список заявок", href: config.routes.ORDERS_LIST },
 *      { label: data?.order ? `Заявка №${data.order.id}` : "Заявка" },
 *    ],
 *  };
 * ```
 */
export interface BreadcrumbHandle<TLoaderFunction = unknown> {
	breadcrumb?:
		| BreadcrumbDataItem[]
		| ((data: ReturnType<typeof useLoaderData<TLoaderFunction>> | undefined) => BreadcrumbDataItem[]);
}

export interface BreadcrumbDataItem {
	label: string;
	href?: string;
}

export function useBreadcrumb() {
	const matches = useMatches() as UIMatch<unknown, BreadcrumbHandle | undefined>[];

	const breadcrumbData = matches.reduce<BreadcrumbDataItem[] | null>(
		(previousBreadcrumb, { data, handle }) => {
			if (!handle) {
				return previousBreadcrumb;
			}

			if (typeof handle.breadcrumb === "function") {
				return handle.breadcrumb(data);
			}

			if (Array.isArray(handle.breadcrumb)) {
				return handle.breadcrumb;
			}

			return previousBreadcrumb;
		},
		null,
	);

	return breadcrumbData;
}
