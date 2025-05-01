import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Link, data, href, useLoaderData } from "react-router";

import { CardContainer } from "~/components/CardContainer";
import LayoutWrapper from "~/components/LayoutWrapper";
import { ServiceProductCard } from "~/components/ProductCard";
import ServiceUserCard from "~/components/ServiceUserCard";
import { buttonVariants } from "~/components/ui/button";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { logout, requireRoleSession, requireUserId } from "~/utils/session.server";
import { useUser } from "~/utils/user";
import { AccountConfirmationAlert } from "~/widgets/account-confitmation-alert";
import type { Route } from "./+types/route";

export const meta: Route.MetaFunction = ({ matches }) => [
	{ title: `${matches[0].data.user?.username ?? ""} | Личный кабинет` },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await requireRoleSession(request, ["admin", "creator"], "/user");

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

	return { product, checks };
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user || (user.role !== "creator" && user.role !== "admin")) {
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
		const { city, phone, legalName, inn, address } = Object.fromEntries(formData);

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
				city: city,
				phone: phone,
				legalName: legalName,
				inn: inn,
				address: address,
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

export default function CreatorPage() {
	const { product, checks } = useLoaderData<typeof loader>();
	const user = useUser();

	return (
		<>
			{!user.activated ? (
				<LayoutWrapper>
					<AccountConfirmationAlert emailSent={user.activateEmailSent} />
				</LayoutWrapper>
			) : null}
			<ServiceUserCard user={user} />
			<LayoutWrapper className="my-6">
				<CardContainer className="flex flex-wrap justify-between gap-x-3">
					<p className="mb-2 flex flex-col gap-2 font-bold font-serif text-xl/none md:flex-row">
						<span>Продажи ваших турпродуктов</span>
						<span className="font-normal font-sans text-base text-gray-500">
							({checks.length} чека на сумму{" "}
							{checks.reduce((prev, check) => prev + check.price, 0)} ₽)
						</span>
					</p>
					<Link to={href("/user/checks")} className={buttonVariants({ variant: "secondary" })}>
						Смотреть
					</Link>
				</CardContainer>
			</LayoutWrapper>
			<div className="my-6 md:my-12">
				<LayoutWrapper className="flex flex-wrap items-baseline justify-between gap-3 px-5">
					<p className="text-xl">Ваши турпродукты</p>
					<Link to={href("/new-product")} className={buttonVariants({ variant: "default" })}>
						Новый турпродукт
					</Link>
				</LayoutWrapper>
				{product.length === 0 ? (
					<p className="mt-24 text-center text-slate-400 text-xl">У вас пока нет объектов</p>
				) : (
					<LayoutWrapper className="mt-6 space-y-6 md:mt-12">
						{product.map((product) => (
							<ServiceProductCard type="product" object={product} key={product.id} />
						))}
					</LayoutWrapper>
				)}
			</div>
		</>
	);
}
