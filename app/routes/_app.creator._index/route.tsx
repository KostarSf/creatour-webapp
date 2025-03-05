import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "react-router";
import { data, redirect } from "react-router";
import { Link, useLoaderData } from "react-router";
import ActionLinkButton from "~/components/ActionLinkButton";
import { ServiceProductCard } from "~/components/ProductCard";
import ServiceUserCard from "~/components/ServiceUserCard";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { logout, requireUserId } from "~/utils/session.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => [
	{ title: `${data?.user.username ?? ""} | Личный кабинет` },
];

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user || user.role !== "creator") {
		return data(
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
			throw data({ error: "Указаны неверные значения" }, { status: 400 });
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

		return {
			error: null,
		};
	}
	if (intent === "product-active-toggle") {
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

		return { error: null };
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

	return { user, product, checks };
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
			<div className="-mx-6 my-6 max-w-7xl border p-6 shadow-blue-900/5 shadow-lg md:mx-auto md:my-12 md:rounded-lg">
				<p className="mb-2 flex flex-col gap-2 font-bold font-serif text-xl/none md:flex-row">
					<span>Продажи ваших турпродуктов</span>
					<span className="font-normal font-sans text-base text-gray-500">
						({checks.length} чека на сумму{" "}
						{checks.reduce((prev, check) => prev + check.price, 0)} ₽)
					</span>
				</p>
				<Link
					to={"checks"}
					className="font-medium text-blue-500 text-lg uppercase hover:underline"
				>
					Смотреть
				</Link>
			</div>
			<div className="my-6 md:my-12">
				<div className="flex flex-wrap items-baseline justify-between gap-3">
					<p className="text-xl">
						<span className="text-blue-500">{user.username}</span> турпродукты
					</p>
					<ActionLinkButton to="/new-product">
						Новый турпродукт
					</ActionLinkButton>
				</div>
				{product.length === 0 ? (
					<p className="mt-24 text-center text-slate-400 text-xl">
						У вас пока нет объектов
					</p>
				) : (
					<div className="-mx-6 mt-6 max-w-7xl space-y-6 md:mx-auto md:mt-12">
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
