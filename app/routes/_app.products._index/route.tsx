import type { Prisma } from "@prisma/client";
import clsx from "clsx";
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
import LayoutWrapper from "~/components/LayoutWrapper";
import { ProductCard } from "~/components/ProductCard";
import { Socials } from "~/components/Socials";
import { Badge } from "~/components/ui/badge";
import { Button, buttonVariants } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { CustomHeaderHandle } from "~/lib/hooks/use-custom-header";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUserId, requireUserId } from "~/utils/session.server";
import { useOptionalUser } from "~/utils/user";
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

	const query = searchParams.get("q");
	const page = Number.parseInt(searchParams.get("page") ?? "1");
	if (Number.isNaN(page) || page < 1) {
		throw new Response(null, { status: 400, statusText: "invalid page parameter" });
	}

	const size = 4;
	const offset = (page - 1) * 4;

	const where: Prisma.ProductFindManyArgs["where"] = {
		...(userId && favorites
			? {
					active: true,
					favors: { some: { id: userId } },
				}
			: {
					active: true,
					beginDate: {
						gte: new Date(),
					},
				}),
		active: true,
		...(query
			? {
					OR: [
						{ name: { contains: query.toLowerCase() } },
						{ description: { contains: query.toLowerCase() } },
					],
				}
			: {}),
	};

	const [products, count] = await db.$transaction([
		db.product.findMany({
			where: where,
			take: size * page,
			orderBy: { beginDate: "asc" },
		}),
		db.product.count({ where: where }),
	]);

	const nextPage = page * size < count ? page + 1 : null;

	return { products, nextPage };
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
	const { products, nextPage } = useLoaderData<typeof loader>();
	const user = useOptionalUser();

	const [searchParams] = useSearchParams();
	const favorites = searchParams.get("type") === "favorites";

	const nextPageParams = new URLSearchParams(searchParams);
	nextPageParams.set("page", String(nextPage ?? "1"));

	const hasFavs = (user?.favoriteProducts.length ?? 0) > 0;

	return (
		<>
			<ProductsListHeader />

			<LayoutWrapper className="my-6 flex gap-5 px-5 md:my-12">
				<Link
					to={href("/products")}
					className={clsx("font-medium text-xl transition", favorites && "opacity-40")}
				>
					Календарь мероприятий
				</Link>
				{user ? (
					<Link
						to=".?type=favorites"
						className={clsx("flex items-center gap-2 font-medium text-xl transition")}
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
			</LayoutWrapper>
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
	);
}

function ProductsListHeader() {
	return (
		<div className="relative h-[500px] max-h-screen">
			<img
				src="/images/landing/landing_bg.webp"
				alt=""
				className="size-full object-cover object-center"
			/>

			<div className="absolute inset-0 flex flex-col items-stretch justify-center bg-black/10 px-5 backdrop-blur-xs md:items-center">
				<Form>
					<p className="py-3 text-center text-lg/tight text-white">
						Отдыхай по новому с командой Креатура
					</p>
					<div className="flex w-full rounded-full md:w-[600px]">
						<Input
							name="q"
							className="h-10 flex-1 rounded-none rounded-l-full bg-background px-5"
							placeholder="Поиск турпродуктов..."
						/>
						<Button type="submit" className="rounded-none rounded-r-full">
							Найти
						</Button>
					</div>
				</Form>
			</div>

			<Header className="absolute top-0 left-0 w-full text-white" />

			<div className="absolute bottom-0 left-0 w-full">
				<div className="mx-auto max-w-6xl px-10 pb-10 md:pb-5">
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
