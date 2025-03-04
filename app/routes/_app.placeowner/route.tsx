import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ActionLinkButton from "~/components/ActionLinkButton";
import { ServiceProductCard } from "~/components/ProductCard";
import ServiceUserCard from "~/components/ServiceUserCard";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { logout, requireUserId } from "~/utils/session.server";

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => [
	{ title: `${data.user.username} | Личный кабинет` },
];

export const action = async ({ request }: ActionArgs) => {
	const userId = await requireUserId(request);
	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user || user.role !== "placeowner") {
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
	} else if (intent === "place-active-toggle") {
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

		return json({ error: null });
	}

	return badRequest({
		error: "Неподдерживаемое действие",
	});
};

export const loader = async ({ request }: LoaderArgs) => {
	const userId = await requireUserId(request);
	const user = await db.user.findUnique({ where: { id: userId } });

	if (!user) throw logout(request);
	if (user.role !== "placeowner") throw redirect("/user");

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

	return json({ user, places });
};

export default function PlaceownerPage() {
	const { user, places } = useLoaderData<typeof loader>();

	return (
		<>
			<div className="my-6 md:my-12">
				<h1 className="font-medium text-xl">Карточка владельца объекта</h1>
			</div>
			<ServiceUserCard user={user} />
			<div className="my-6 md:my-12">
				<div className="flex items-baseline justify-between flex-wrap gap-3">
					<p className="text-xl">
						<span className="text-blue-500">{user.username}</span> объекты
					</p>
					<ActionLinkButton to="/new-place">Новый объект</ActionLinkButton>
				</div>
				{places.length === 0 ? (
					<p className="text-center mt-24 text-xl text-slate-400">
						У вас пока нет объектов
					</p>
				) : (
					<div className="space-y-6 mt-6 md:mt-12 -mx-6 md:mx-auto max-w-7xl">
						{places.map((place) => (
							<ServiceProductCard
								type="place"
								object={place}
								key={place.id}
								usedIn={place.routes}
							/>
						))}
					</div>
				)}
			</div>
		</>
	);
}
