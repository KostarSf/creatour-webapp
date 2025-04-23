import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Link, data, href, useLoaderData } from "react-router";

import LayoutWrapper from "~/components/LayoutWrapper";
import { ServiceProductCard } from "~/components/ProductCard";
import ServiceUserCard from "~/components/ServiceUserCard";
import { buttonVariants } from "~/components/ui/button";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { requireRoleSession, requireUserId } from "~/utils/session.server";
import { useUser } from "~/utils/user";
import type { Route } from "./+types/route";

export const meta: Route.MetaFunction = ({ matches }) => [
	{ title: `${matches[0].data.user?.username ?? ""} | Личный кабинет` },
];

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user || user.role !== "placeowner") {
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
	if (intent === "place-active-toggle") {
		const placeId = formData.get("placeId");

		if (typeof placeId !== "string") {
			return badRequest({
				error: "Неверный ID места",
			});
		}

		const place = await db.place.findUnique({ where: { id: placeId } });
		if (!place) {
			return badRequest({
				error: "Такого места не существует",
			});
		}

		await db.place.update({
			where: { id: placeId },
			data: { active: !place.active },
		});

		return { error: null };
	}

	return badRequest({
		error: "Неподдерживаемое действие",
	});
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await requireRoleSession(request, "placeowner", "/user");

	const places = await db.place.findMany({
		where: {
			creatorId: user.id,
		},
		include: {
			routes: {
				include: {
					product: true,
				},
			},
		},
		orderBy: { createdAt: "desc" },
	});

	return { places };
};

export default function PlaceownerPage() {
	const { places } = useLoaderData<typeof loader>();
	const user = useUser();

	return (
		<>
			<ServiceUserCard user={user} />
			<div className="my-6 md:my-12">
				<LayoutWrapper className="flex flex-wrap items-baseline justify-between gap-3 px-5">
					<p className="text-xl">Ваши объекты</p>
					<Link to={href("/new-place")} className={buttonVariants({ variant: "default" })}>
						Новый объект
					</Link>
				</LayoutWrapper>
				{places.length === 0 ? (
					<p className="mt-24 text-center text-slate-400 text-xl">У вас пока нет объектов</p>
				) : (
					<LayoutWrapper className="mt-6 space-y-6 md:mt-12">
						{places.map((place) => (
							<ServiceProductCard
								type="place"
								object={place}
								key={place.id}
								usedIn={place.routes}
							/>
						))}
					</LayoutWrapper>
				)}
			</div>
		</>
	);
}
