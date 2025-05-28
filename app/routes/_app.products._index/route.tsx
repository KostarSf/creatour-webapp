import type { Prisma, Tag } from "@prisma-app/client";
import clsx from "clsx";
import { FilterIcon, XIcon } from "lucide-react";
import React, { useRef } from "react";
import type { ActionFunctionArgs, MetaFunction } from "react-router";
import {
	Form,
	Link,
	data,
	href,
	isRouteErrorResponse,
	redirect,
	useLoaderData,
	useSearchParams,
} from "react-router";
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis } from "recharts";
import LayoutWrapper from "~/components/LayoutWrapper";
import { ProductCard } from "~/components/ProductCard";
import { Socials } from "~/components/Socials";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "~/components/ui/chart";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { CustomHeaderHandle } from "~/lib/hooks/use-custom-header";
import { USER_ROLES, type UserRole } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUserId, requireUserId } from "~/utils/session.server";
import { useOptionalUser, useUser } from "~/utils/user";
import { Header } from "~/widgets/header";
import type { Route } from "./+types/route";

export const meta: MetaFunction = () => [{ title: "Календарь мероприятий | Креатур" }];

export const handle: CustomHeaderHandle = {
	customHeader: true,
};

export const loader = async ({ request }: Route.LoaderArgs) => {
	const searchParams = new URL(request.url).searchParams;
	const favorites = searchParams.get("type") === "favorites";
	const userId = await getUserId(request);
	const selectedTags = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];
	const news = Boolean(searchParams.get("news"));

	const query = searchParams.get("q");
	const page = Number.parseInt(searchParams.get("page") ?? "1");
	if (Number.isNaN(page) || page < 1) {
		throw new Response(null, { status: 400, statusText: "invalid page parameter" });
	}

	const size = 4;
	const offset = (page - 1) * 4;
	const newsMinDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);

	const where: Prisma.ProductFindManyArgs["where"] = {
		AND: [
			news ? { createdAt: { gt: newsMinDate } } : {},
			selectedTags.length ? { tags: { some: { id: { in: selectedTags } } } } : {},
			userId && favorites
				? {
						active: true,
						favors: { some: { id: userId } },
					}
				: {
						active: true,
						beginDate: {
							gte: new Date(),
						},
					},
		],
		active: true,
		...(query
			? {
					OR: [
						{ name: { contains: query } },
						{ description: { contains: query } },
						{ short: { contains: query } },
					],
				}
			: {}),
	};

	const [products, count, tags, newsCount, users] = await db.$transaction([
		db.product.findMany({
			where: where,
			take: size * page,
			orderBy: { beginDate: "asc" },
		}),
		db.product.count({ where: where }),
		db.tag.findMany({
			where: {
				products: {
					some:
						userId && favorites
							? {
									favors: userId && favorites ? { some: { id: userId } } : undefined,
								}
							: {
									active: true,
									beginDate: {
										gte: new Date(),
									},
								},
				},
			},
			orderBy: { name: "asc" },
		}),
		db.product.count({ where: { active: true, createdAt: { gt: newsMinDate } } }),
		db.user.findMany({ where: { role: USER_ROLES.user.key }, select: { id: true, sex: true } }),
	]);

	const nextPage = page * size < count ? page + 1 : null;

	return { products, nextPage, tags, count, users, hasNews: newsCount > 0 };
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user) {
		return data(
			{
				error: "Некорректный пользователь",
			},
			{ status: 403 },
		);
	}

	const formData = await request.formData();
	const intent = formData.get("intent");
	const redirectTo = formData.get("redirectTo");

	if (intent === "activate-product") {
		const productId = formData.get("productId");
		const userId = formData.get("userId");

		if (typeof productId !== "string" || typeof userId !== "string") {
			return badRequest({
				error: "Ошибка запроса",
			});
		}

		const product = await db.product.findUnique({ where: { id: productId } });
		const user = await db.user.findUnique({ where: { id: userId } });

		if (!product || !user) {
			return badRequest({
				error: "Ошибка запроса",
			});
		}

		const buyed = await db.product.findFirst({
			where: {
				buyers: {
					some: {
						id: product.id,
					},
				},
			},
		});

		if (buyed) {
			return {};
		}

		await db.product.update({
			where: { id: product.id },
			data: {
				buyers: {
					connect: {
						id: user.id,
					},
				},
			},
		});

		await db.check.create({
			data: {
				productId: product.id,
				buyerId: user.id,
				price: product.price,
			},
		});
	} else {
		return badRequest({
			error: "Неподдерживаемое действие",
		});
	}

	if (!redirectTo || typeof redirectTo !== "string") {
		return {
			error: null,
		};
	}
	return redirect(redirectTo);
};

export default function ProductsCatalog() {
	const { products, nextPage, tags, count, hasNews } = useLoaderData<typeof loader>();
	const user = useOptionalUser();

	const [searchParams] = useSearchParams();

	const favorites = searchParams.get("type") === "favorites";
	const news = Boolean(searchParams.get("news"));
	const stats = Boolean(searchParams.get("stats"));
	const events = !favorites && !news && !stats;

	const nextPageParams = new URLSearchParams(searchParams);
	nextPageParams.set("page", String(nextPage ?? "1"));

	const hasFavs = (user?.favoriteProducts.length ?? 0) > 0;

	return (
		<>
			<ProductsListHeader />

			<div id="content" />

			<LayoutWrapper className="my-6 md:my-12">
				<div className="flex gap-5 overflow-x-auto whitespace-nowrap px-5 md:px-0">
					<Link
						to={href("/products")}
						className={clsx("font-medium text-xl transition", !events && "opacity-40")}
						preventScrollReset
					>
						Календарь мероприятий
					</Link>
					{hasNews ? (
						<Link
							to={`${href("/products")}?news=true`}
							className={clsx("font-medium text-xl transition", !news && "opacity-40")}
							preventScrollReset
						>
							Новинки
						</Link>
					) : null}
					{user &&
					([USER_ROLES.admin.key, USER_ROLES.creator.key] as UserRole[]).includes(user.role) ? (
						<Link
							to={`${href("/products")}?stats=true`}
							className={clsx("font-medium text-xl transition", !stats && "opacity-40")}
							preventScrollReset
						>
							Статистика
						</Link>
					) : null}
					{user ? (
						<Link
							to=".?type=favorites"
							className={clsx("flex items-center gap-2 font-medium text-xl transition")}
							preventScrollReset
						>
							<span className={clsx(!favorites && "opacity-40")}>Избранное</span>
							<Badge
								variant="outline"
								className={clsx("transition", !hasFavs && "scale-75 opacity-0")}
							>
								{user.favoriteProducts.length}
							</Badge>
						</Link>
					) : null}
					{user ? (
						<div className="flex flex-1 justify-end">
							<Link
								to={href("/user")}
								className={clsx(
									"flex items-center gap-2 font-medium text-xl opacity-40 transition hover:opacity-100",
								)}
							>
								Профиль
							</Link>
						</div>
					) : null}
				</div>
			</LayoutWrapper>
			{!stats ? (
				<>
					{tags.length ? (
						<LayoutWrapper className="my-6 flex flex-wrap justify-between gap-x-3 px-5 md:my-12">
							<TagsChooser tags={tags} />
							{count > 0 ? (
								<p className="py-2 text-muted-foreground">{`Нашлось ${count} ${pluralizeProducts(count)}`}</p>
							) : null}
						</LayoutWrapper>
					) : null}
					<LayoutWrapper className="my-6 md:my-12">
						{products.length === 0 ? (
							<>
								<p className="mt-24 text-center text-slate-400 text-xl">
									{favorites
										? "Похоже, у вас пока нет избранных продуктов!"
										: "Каталог пока что пуст! Зайдите позже"}
								</p>
								{favorites ? (
									<div className="mt-5 grid place-items-center">
										<Link to={href("/products")} className={buttonVariants()}>
											К покупкам
										</Link>
									</div>
								) : null}
							</>
						) : (
							<div className="mt-6 space-y-6 md:mt-12">
								{products.map((product) => (
									<ProductCard
										key={product.id}
										type="product"
										object={product}
										className="max-md:rounded-none max-md:border-0"
									/>
								))}
								{nextPage ? (
									<div className="mt-16 grid place-items-center">
										<Link
											to={{ search: `?${nextPageParams}` }}
											className={buttonVariants({ variant: "default", size: "lg" })}
											replace
											preventScrollReset
											prefetch="viewport"
										>
											Показать больше
										</Link>
									</div>
								) : null}
							</div>
						)}
					</LayoutWrapper>
				</>
			) : (
				<LayoutWrapper className="my-6 px-5 md:my-12">
					<CreatorStats />
				</LayoutWrapper>
			)}
		</>
	);
}

function TagsChooser({ tags }: { tags: Tag[] }) {
	const [searchParams] = useSearchParams();
	const currentTagsIds = (searchParams.get("tags") ?? "").split(",");
	const currentTags = tags.filter((tag) => currentTagsIds.includes(tag.id));

	const clearTagsSearchParams = new URLSearchParams(searchParams);
	clearTagsSearchParams.delete("tags");

	const tagLinkSearchParams = (tag: Tag) => {
		const linkParams = new URLSearchParams(searchParams);
		const hasTag = currentTagsIds.includes(tag.id);
		if (hasTag) {
			linkParams.set("tags", currentTagsIds.filter((id) => id !== tag.id).join(","));
		} else {
			linkParams.set("tags", [...currentTagsIds, tag.id].join(","));
		}

		return `?${linkParams}`;
	};

	return (
		<div className="flex flex-wrap items-center gap-2">
			<Popover>
				<PopoverTrigger className="group/filters" asChild>
					<Button variant="outline">
						<FilterIcon />
						Фильтры
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto max-w-screen overflow-x-auto rounded-2xl p-6" align="start">
					<div className="flex max-h-80 flex-col flex-wrap gap-x-6 gap-y-4">
						{tags.map((tag) => (
							<Link
								key={tag.id}
								to={{ search: tagLinkSearchParams(tag) }}
								className={clsx(
									currentTagsIds.includes(tag.id)
										? "text-primary"
										: "hover:text-muted-foreground",
								)}
								preventScrollReset
							>
								#{tag.name}
							</Link>
						))}
					</div>
				</PopoverContent>
			</Popover>
			{currentTags.length ? (
				<Link
					to={{ search: `?${clearTagsSearchParams}` }}
					className={buttonVariants({ variant: "outline", size: "icon" })}
					title="Очистить фильтры"
					preventScrollReset
				>
					<XIcon />
					<span className="sr-only">Очистить фильтры</span>
				</Link>
			) : null}
			{currentTags.map((tag) => (
				<Link
					key={tag.id}
					to={{ search: tagLinkSearchParams(tag) }}
					className={buttonVariants({ variant: "secondary" })}
					preventScrollReset
				>
					#{tag.name}
				</Link>
			))}
		</div>
	);
}

function ProductsListHeader() {
	const queryFieldRef = useRef<HTMLInputElement>(null);

	const [searchParams] = useSearchParams();
	const queryValue = searchParams.get("q") ?? "";

	React.useEffect(() => {
		const queryField = queryFieldRef.current;
		if (queryField) {
			queryField.value = queryValue;
		}
	}, [queryValue]);

	return (
		<div className="relative h-[500px] max-h-screen">
			<img
				src="/images/landing/landing_bg.webp"
				alt=""
				className="size-full object-cover object-center"
			/>

			<div className="absolute inset-0 flex flex-col items-stretch justify-center bg-black/10 px-5 backdrop-blur-xs md:items-center md:px-10">
				<Form className="flex w-full flex-col items-center">
					<p className="py-3 text-center font-light text-white text-xl">
						Отдыхай по-новому с командой Креатура
					</p>
					<div className="flex w-full justify-center rounded-full">
						<Input
							ref={queryFieldRef}
							name="q"
							className="h-10 w-full rounded-none rounded-l-full bg-background px-5 font-light md:h-12 md:max-w-[700px] md:px-8 md:text-lg lg:h-16 lg:px-12 lg:text-xl"
							placeholder="Поиск турпродуктов..."
							defaultValue={queryValue}
						/>
						<Button
							type="submit"
							className="h-10 rounded-none rounded-r-full px-5 font-light transition md:h-12 md:px-8 md:text-lg lg:h-16 lg:px-12 lg:text-xl"
						>
							Найти
						</Button>
					</div>
				</Form>
			</div>

			<Header className="absolute top-0 left-0 w-full text-white" />

			<div className="absolute bottom-0 left-0 w-full">
				<div className="mx-auto max-w-[100rem] px-10 pb-10 md:pb-5">
					<Socials className="text-white" />
				</div>
			</div>
		</div>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	if (!isRouteErrorResponse(error)) {
		throw error;
	}

	return (
		<>
			<ProductsListHeader />

			<div className="flex flex-col items-center gap-5 px-10 py-32">
				<p className="text-2xl text-destructive">{`${error.status}: ${error.statusText}`}</p>
				<Link to={href("/products")} className={buttonVariants({ variant: "outline" })}>
					Вернуться в каталог
				</Link>
			</div>
		</>
	);
}

const productTitles = ["мероприятие", "мероприятия", "мероприятий"];
const cases = [2, 0, 1, 1, 1, 2];
function pluralizeProducts(number: number) {
	return productTitles[number % 100 > 4 && number % 100 < 20 ? 2 : cases[Math.min(number % 10, 5)]];
}

function CreatorStats() {
	const user = useUser();

	return (
		<div>
			<h2 className="font-serif text-3xl">Добрый день, {user.name || user.username || user.email}</h2>
			<div className="mt-4 grid gap-3 xl:grid-cols-4">
				<div className="grid grid-cols-2 gap-3 xl:grid-cols-1 xl:grid-rows-2">
					<Card>
						<CardContent>
							<p className="text-center font-serif text-2xl sm:text-5xl">245 000</p>
							<p className="mt-2 text-center text-sm uppercase sm:text-lg">рублей</p>
							<p className="text-center font-serif uppercase sm:text-3xl/none">заработано</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent>
							<p className="text-center font-serif text-2xl sm:text-5xl">15</p>
							<p className="mt-2 text-center text-sm uppercase sm:text-lg">новых позиций</p>
							<p className="text-center font-serif uppercase sm:text-3xl/none">в марте</p>
						</CardContent>
					</Card>
				</div>
				<AgeChartComponent className="xl:col-span-3" />
			</div>

			<div className="mt-8 grid gap-3 xl:grid-cols-3">
				<GenderChartComponent />
				<div className="grid grid-rows-4 gap-3">
					<Card className="row-span-2 justify-center">
						<CardContent>
							<p className="text-center font-serif text-2xl sm:text-5xl">118</p>
							<p className="mt-2 text-center text-sm uppercase sm:text-lg">пользователей</p>
							<p className="text-center font-serif uppercase sm:text-3xl/none">
								добавили в избранное
							</p>
						</CardContent>
					</Card>
					<Card className="justify-center">
						<CardContent className="flex items-center justify-center gap-2">
							<p className="text-center font-serif text-2xl sm:text-5xl">16</p>
							<div>
								<p className="mt-2 text-center text-sm uppercase sm:text-lg">пользователей</p>
								<p className="text-center font-serif uppercase sm:text-3xl/none">
									добавили в избранное
								</p>
							</div>
						</CardContent>
					</Card>
					<Card className="justify-center">
						<CardContent className="flex items-center justify-center gap-2">
							<p className="text-center font-serif text-2xl sm:text-5xl">16</p>
							<div>
								<p className="text-center font-serif uppercase sm:text-3xl/none">
									городов-участников
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="grid grid-rows-2 gap-3">
					<Card className="justify-center">
						<CardContent>
							<p className="text-center font-serif text-2xl sm:text-5xl">179</p>
							<p className="mt-2 text-center text-sm uppercase sm:text-lg">пользователей</p>
							<p className="text-center font-serif uppercase sm:text-3xl/none">постоянные</p>
						</CardContent>
					</Card>
					<Card className="justify-center">
						<CardContent>
							<p className="text-center font-serif text-2xl sm:text-5xl">24</p>
							<p className="mt-2 text-center text-sm uppercase sm:text-lg">новых отзыва</p>
							<p className="text-center font-serif uppercase sm:text-3xl/none">в марте</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

const chartData = [
	{ age: "sector1", visitors: 60, fill: "var(--color-primary)" },
	{ age: "sector2", visitors: 140, fill: "var(--color-primary)" },
	{ age: "sector3", visitors: 200, fill: "var(--chart-2)" },
	{ age: "sector4", visitors: 170, fill: "var(--color-primary)" },
	{ age: "sector5", visitors: 90, fill: "var(--color-primary)" },
	{ age: "sector6", visitors: 50, fill: "var(--color-primary)" },
	{ age: "sector7", visitors: 30, fill: "var(--color-primary)" },
];

const chartConfig = {
	visitors: {
		label: "Кол-во покупателей",
	},
	sector1: {
		label: "14-17",
	},
	sector2: {
		label: "18-24",
	},
	sector3: {
		label: "25-35",
	},
	sector4: {
		label: "36-44",
	},
	sector5: {
		label: "45-54",
	},
	sector6: {
		label: "55-64",
	},
	sector7: {
		label: "65+",
	},
} satisfies ChartConfig;

function AgeChartComponent({ className }: { className?: string }) {
	return (
		<Card className={className}>
			<CardHeader className="relative">
				<CardTitle>Возрастной диапазон</CardTitle>

				<Tabs defaultValue="all" className="top-0 right-6 sm:absolute">
					<TabsList className="w-full">
						<TabsTrigger value="all">Все</TabsTrigger>
						<TabsTrigger value="female">Женщины</TabsTrigger>
						<TabsTrigger value="male">Мужчины</TabsTrigger>
					</TabsList>
				</Tabs>
			</CardHeader>
			<CardContent className="relative mr-6 ml-3 h-56 px-0">
				<ChartContainer config={chartConfig} className="absolute inset-0 h-56 w-full">
					<BarChart
						accessibilityLayer
						data={chartData}
						layout="vertical"
						margin={{
							left: 0,
						}}
					>
						<YAxis
							dataKey="age"
							type="category"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							tickFormatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label}
						/>
						<XAxis dataKey="visitors" type="number" hide />
						<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
						<Bar dataKey="visitors" layout="vertical" radius={5} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}

const genderChartData = [
	{ gender: "male", visitors: 27, fill: "var(--color-primary)" },
	{ gender: "female", visitors: 73, fill: "var(--chart-2)" },
];

const genderChartConfig = {
	visitors: {
		label: "Кол-во",
	},
	male: {
		label: "Мужчины",
	},
	female: {
		label: "Женщины",
	},
	none: {
		label: "Не указано",
	},
} satisfies ChartConfig;

function GenderChartComponent({ className }: { className?: string }) {
	const { users } = useLoaderData<typeof loader>();

	let male = 0;
	let female = 0;
	let none = 0;
	for (const user of users) {
		if (user.sex === "male") male += 1;
		if (user.sex === "female") female += 1;
		if (!user.sex) none += 1;
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Пол</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-1 items-center pb-0">
				<ChartContainer
					config={genderChartConfig}
					className="mx-auto aspect-square max-h-[300px] flex-1"
				>
					<PieChart>
						<ChartTooltip content={<ChartTooltipContent nameKey="visitors" hideLabel />} />
						<Pie
							data={[
								{ gender: "male", visitors: male, fill: "var(--color-primary)" },
								{ gender: "female", visitors: female, fill: "var(--chart-2)" },
								{ gender: "none", visitors: none, fill: "var(--color-secondary)" },
							]}
							dataKey="visitors"
						/>
						<ChartLegend
							content={<ChartLegendContent nameKey="gender" />}
							className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
						/>
					</PieChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
