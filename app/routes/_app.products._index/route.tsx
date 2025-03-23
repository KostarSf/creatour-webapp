import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { data, redirect, useLoaderData } from "react-router";
import { ProductCard } from "~/components/ProductCard";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { requireUserId } from "~/utils/session.server";

export const meta: MetaFunction = () => [{ title: "Календарь мероприятий | Креатур" }];

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

export const loader = async () => {
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

	return { products };
};

export default function ProductsCatalog() {
	const { products } = useLoaderData<typeof loader>();

	return (
		<>
			<div className="mx-auto my-6 max-w-6xl px-5 md:my-12 md:px-10">
				<h1 className="font-medium text-xl">Календарь мероприятий</h1>
			</div>
			<div className="mx-auto my-6 max-w-6xl px-5 md:my-12 md:px-10">
				{products.length === 0 ? (
					<p className="mt-24 text-center text-slate-400 text-xl">
						Каталог пока что пуст! Зайдите позже
					</p>
				) : (
					<div className="mt-6 space-y-6 md:mt-12">
						{products.map((product) => (
							<ProductCard key={product.id} type="product" object={product} />
						))}
					</div>
				)}
			</div>
		</>
	);
}
