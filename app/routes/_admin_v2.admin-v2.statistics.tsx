import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import type { Route } from "./+types/_admin_v2.admin-v2.statistics";

import React from "react";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { BreadcrumbHandle } from "~/hooks/use-breadcrumb";
import { PRODUCT_TYPES_LIST } from "~/lib/product-types";
import { USER_ROLES } from "~/lib/user-roles";
import { db } from "~/utils/db.server";

export const handle: BreadcrumbHandle = { breadcrumb: [{ label: "Статистика" }] };

export const loader = async () => {
	const priceStats = PRODUCT_TYPES_LIST.map((type) => ({
		id: type.key,
		title: type.title,
		min: 580,
		max: 5150,
		avg: 2500,
		total: 75820,
		count: 45,
	}));

	const creators = await db.user.findMany({
		where: { role: USER_ROLES.creator.key },
	});

	const creatorsStats = creators.map((creator) => ({
		id: creator.id,
		name: creator.legalName || creator.name || creator.username,
		totalCount: Math.round(Math.random() * 100),
		totalAmount: Math.round(Math.random() * 1000) * 100,
	}));

	return { priceStats, creatorsStats };
};

export default function AdminStatisticsRoute({ loaderData }: Route.ComponentProps) {
	return (
		<Tabs defaultValue="users">
			<div className="overflow-x-auto">
				<TabsList>
					<TabsTrigger value="users">Пользователи</TabsTrigger>
					<TabsTrigger value="price">Продажи по типам туров</TabsTrigger>
					<TabsTrigger value="creators">Продажи по разработчикам туров</TabsTrigger>
				</TabsList>
			</div>
			<TabsContent value="users">
				<RangeSelectors />
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Новых клиентов</TableHead>
							<TableHead>Новых разработчиков туров</TableHead>
							<TableHead>Новых владельцев ресурсов</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>25</TableCell>
							<TableCell>11</TableCell>
							<TableCell>9</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TabsContent>
			<TabsContent value="price">
				<RangeSelectors />
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Тип турпродукта</TableHead>
							<TableHead className="text-right">Минимальная сумма</TableHead>
							<TableHead className="text-right">Максимальная сумма</TableHead>
							<TableHead className="text-right">Средняя сумма</TableHead>
							<TableHead className="text-right">Общая сумма</TableHead>
							<TableHead className="text-right">Количество проданных</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loaderData.priceStats.map((stat) => (
							<TableRow key={stat.id}>
								<TableCell className="font-medium">{stat.title}</TableCell>
								<TableCell className="text-right">
									{stat.min.toLocaleString("ru")} ₽
								</TableCell>
								<TableCell className="text-right">
									{stat.max.toLocaleString("ru")} ₽
								</TableCell>
								<TableCell className="text-right">
									{stat.avg.toLocaleString("ru")} ₽
								</TableCell>
								<TableCell className="text-right font-medium">
									{stat.total.toLocaleString("ru")} ₽
								</TableCell>
								<TableCell className="text-right">
									{stat.count.toLocaleString("ru")}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableCell colSpan={4}>Всего</TableCell>
							<TableCell className="text-right">
								{loaderData.priceStats
									.reduce((acc, stat) => acc + stat.total, 0)
									.toLocaleString("ru")}{" "}
								₽
							</TableCell>
							<TableCell className="text-right">
								{loaderData.priceStats
									.reduce((acc, stat) => acc + stat.count, 0)
									.toLocaleString("ru")}
							</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			</TabsContent>
			<TabsContent value="creators">
				<RangeSelectors />
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Наименование организации</TableHead>
							<TableHead className="text-right">Количество проданных позиций</TableHead>
							<TableHead className="text-right">Общая сумма</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loaderData.creatorsStats.map((stat) => (
							<TableRow key={stat.id}>
								<TableCell className="font-medium">{stat.name}</TableCell>
								<TableCell className="text-right">
									{stat.totalCount.toLocaleString("ru")}
								</TableCell>
								<TableCell className="text-right font-medium">
									{stat.totalAmount.toLocaleString("ru")} ₽
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableCell colSpan={1}>Всего</TableCell>
							<TableCell className="text-right">
								{loaderData.creatorsStats
									.reduce((acc, stat) => acc + stat.totalCount, 0)
									.toLocaleString("ru")}
							</TableCell>
							<TableCell className="text-right">
								{loaderData.creatorsStats
									.reduce((acc, stat) => acc + stat.totalAmount, 0)
									.toLocaleString("ru")}{" "}
								₽
							</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			</TabsContent>
		</Tabs>
	);
}

function RangeSelectors() {
	const [value, setValue] = React.useState("this-month");

	return (
		<div className="flex flex-col items-stretch gap-2 py-4 sm:flex-row sm:items-center">
			<Select value={value} onValueChange={setValue}>
				<SelectTrigger className="w-full sm:w-64">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="this-month">Текущий месяц</SelectItem>
					<SelectItem value="last-month">Прошедший месяц</SelectItem>
					<SelectItem value="this-quarter">Текущий квартал</SelectItem>
					<SelectItem value="last-quarter">Прошедший квартал</SelectItem>
					<SelectItem value="this-year">Текущий год</SelectItem>
					<SelectItem value="last-year">Прошедший год</SelectItem>
					<SelectItem value="period">За период</SelectItem>
				</SelectContent>
			</Select>

			{value === "period" ? (
				<>
					<Input type="date" className="sm:w-56" />
					<Input type="date" className="sm:w-56" />
				</>
			) : null}
		</div>
	);
}
