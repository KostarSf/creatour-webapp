import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { data, redirect } from "react-router";
import { useLoaderData } from "react-router";
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

	return { user, places };
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
				<div className="flex flex-wrap items-baseline justify-between gap-3">
					<p className="text-xl">
						<span className="text-blue-500">{user.username}</span> объекты
					</p>
					<ActionLinkButton to="/new-place">Новый объект</ActionLinkButton>
				</div>
				{places.length === 0 ? (
					<p className="mt-24 text-center text-slate-400 text-xl">У вас пока нет объектов</p>
				) : (
					<div className="-mx-6 mt-6 max-w-7xl space-y-6 md:mx-auto md:mt-12">
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
