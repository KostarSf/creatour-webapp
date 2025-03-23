import type { ActionFunctionArgs } from "react-router";
import { type LoaderFunctionArgs, data, redirect, useLoaderData } from "react-router";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUserSessionPayload, logout, requireUserId } from "~/utils/session.server";
import { useUser } from "~/utils/user";
import type { Route } from "./+types/route";
import NextEventBanner from "./NextEventBanner";
import UserCard from "./UserCard";

export const meta: Route.MetaFunction = ({ matches }) => [
	{ title: `${matches[0].data.user?.username ?? ""} | Личный кабинет` },
];

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user || user.role !== "user") {
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
		const { city, phone } = Object.fromEntries(formData);

		if (typeof city !== "string" || typeof phone !== "string") {
			throw data({ error: "Указаны неверные значения" }, { status: 400 });
		}

		await db.user.update({
			where: { id: userId },
			data: {
				city: city || user.city,
				phone: phone || user.phone,
			},
		});
	} else {
		return badRequest({
			error: "Неподдерживаемое действие",
		});
	}

	return {
		error: null,
	};
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await getUserSessionPayload(request);

	if (!user) throw logout(request);
	if (user.role === "placeowner") throw redirect("/placeowner");
	if (user.role === "creator") throw redirect("/creator");

	const checksCountPromise = db.check.count({ where: { buyerId: user.id } });
	const nextEventPromise = db.product.findFirst({
		where: {
			active: true,
			beginDate: { gte: new Date() },
			buyers: {
				some: {
					id: user.id,
				},
			},
		},
		orderBy: {
			beginDate: "asc",
		},
	});

	const [checksCount, nextEvent] = await db.$transaction([checksCountPromise, nextEventPromise]);

	return { checksCount, nextEvent };
};

export default function UserPage() {
	const { checksCount, nextEvent } = useLoaderData<typeof loader>();
	const user = useUser();

	return (
		<div>
			{nextEvent && (
				<NextEventBanner product={nextEvent} username={user.username} className="-mt-3 md:-mt-6" />
			)}
			<UserCard user={user} checksCount={checksCount} />
		</div>
	);
}
