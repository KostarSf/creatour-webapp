import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ProductCard } from "~/components/ProductCard";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUserId, requireUserId } from "~/utils/session.server";

export const meta: MetaFunction = () => [
	{ title: "Календарь мероприятий | Креатур" },
];

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user) {
		return json(
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
			return json({});
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
		return json({
			error: null,
		});
	}
	return redirect(redirectTo);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userId = await getUserId(request);
	const user = userId
		? await db.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					role: true,
					activeProducts: {
						select: {
							id: true,
						},
					},
				},
			})
		: null;

	const products = await db.product.findMany({
		where: {
			active: true,
			beginDate: {
				gte: new Date(),
			},
		},
		orderBy: {
			beginDate: "asc",
		},
	});

	return json({ products, user });
};

export default function ProductsCatalog() {
	const { products, user } = useLoaderData<typeof loader>();

	return (
		<>
			<div className="my-6 md:my-12">
				<h1 className="font-medium text-xl">Календарь мероприятий</h1>
			</div>
			<div className="my-6 md:my-12">
				{products.length === 0 ? (
					<p className="mt-24 text-center text-slate-400 text-xl">
						Каталог пока что пуст! Зайдите позже
					</p>
				) : (
					<div className="-mx-6 mt-6 max-w-7xl space-y-6 md:mx-auto md:mt-12">
						{products.map((product) => (
							<ProductCard
								type="product"
								object={product}
								key={product.id}
								canBuy={user?.role === "user" || false}
								buyed={
									user?.activeProducts.findIndex((p) => p.id === product.id) !==
									-1
								}
								userId={user?.id}
							/>
						))}
					</div>
				)}
			</div>
		</>
	);
}
