import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import ActionLinkButton from "~/components/ActionLinkButton";
import { ServiceProductCard } from "~/components/ProductCard";
import ServiceUserCard from "~/components/ServiceUserCard";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { logout, requireUserId } from "~/utils/session.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => [
	{ title: `${data.user.username} | Личный кабинет` },
];

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user || user.role !== "creator") {
		return json(
			{
				error: "Некорректный пользователь",
			},
			{ status: 403 },
		);
	}

	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "change-info") {
		const { city, phone, legalName, inn, address } =
			Object.fromEntries(formData);

		if (
			typeof city !== "string" ||
			typeof phone !== "string" ||
			typeof legalName !== "string" ||
			typeof inn !== "string" ||
			typeof address !== "string"
		) {
			throw json({ error: "Указаны неверные значения" }, { status: 400 });
		}

		await db.user.update({
			where: { id: userId },
			data: {
				city: city || user.city,
				phone: phone || user.phone,
				legalName: legalName || user.legalName,
				inn: inn || user.inn,
				address: address || user.address,
			},
		});

		return json({
			error: null,
		});
	} else if (intent === "product-active-toggle") {
		const productId = formData.get("productId");

		if (typeof productId !== "string") {
			return badRequest({
				error: "Неверный ID турпродукта",
			});
		}

		const product = await db.product.findUnique({ where: { id: productId } });
		if (!product) {
			return badRequest({
				error: "Такого турпродукта не существует",
			});
		}

		await db.product.update({
			where: { id: productId },
			data: { active: !product.active },
		});

		return json({ error: null });
	}

	return badRequest({
		error: "Неподдерживаемое действие",
	});
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);
	const user = await db.user.findUnique({ where: { id: userId } });

	if (!user) throw logout(request);
	if (user.role !== "creator") throw redirect("/user");

	const product = await db.product.findMany({
		where: {
			creatorId: user.id,
		},
		orderBy: { createdAt: "desc" },
	});

	const checks = await db.check.findMany({
		where: {
			product: {
				creator: {
					id: user.id,
				},
			},
		},
	});

	return json({ user, product, checks });
};

export default function CreatorPage() {
	const { user, product, checks } = useLoaderData<typeof loader>();

	return (
		<>
			<div className="my-6 md:my-12">
				<h1 className="font-medium text-xl">
					Карточка разработчика турпродуктов
				</h1>
			</div>
			<ServiceUserCard user={user} />
			<div className="my-6 md:my-12 border shadow-lg shadow-blue-900/5 p-6 -mx-6 md:mx-auto md:rounded-lg max-w-7xl">
				<p className="font-serif font-bold text-xl/none mb-2 flex flex-col gap-2 md:flex-row">
					<span>Продажи ваших турпродуктов</span>
					<span className="font-sans font-normal text-gray-500 text-base">
						({checks.length} чека на сумму{" "}
						{checks.reduce((prev, check) => prev + check.price, 0)} ₽)
					</span>
				</p>
				<Link
					to={"checks"}
					className="text-blue-500 uppercase font-medium text-lg hover:underline"
				>
					Смотреть
				</Link>
			</div>
			<div className="my-6 md:my-12">
				<div className="flex items-baseline justify-between flex-wrap gap-3">
					<p className="text-xl">
						<span className="text-blue-500">{user.username}</span> турпродукты
					</p>
					<ActionLinkButton to="/new-product">
						Новый турпродукт
					</ActionLinkButton>
				</div>
				{product.length === 0 ? (
					<p className="text-center mt-24 text-xl text-slate-400">
						У вас пока нет объектов
					</p>
				) : (
					<div className="space-y-6 mt-6 md:mt-12 -mx-6 md:mx-auto max-w-7xl">
						{product.map((product) => (
							<ServiceProductCard
								type="product"
								object={product}
								key={product.id}
							/>
						))}
					</div>
				)}
			</div>
		</>
	);
}
