import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import type { Route } from "./+types/api.favorites";

export const action = async ({ request }: Route.ActionArgs) => {
	const userId = await requireUserId(request);

	const formData = await request.formData();
	const productId = formData.get("productId") as string;
	const intent = formData.get("intent") as string;

	try {
		if (intent === "add") {
			await db.user.update({
				data: {
					favoriteProducts: {
						connect: {
							id: productId,
						},
					},
				},
				where: {
					id: userId,
				},
			});
		}

		if (intent === "remove") {
			await db.user.update({
				data: {
					favoriteProducts: {
						disconnect: {
							id: productId,
						},
					},
				},
				where: {
					id: userId,
				},
			});
		}
	} catch (err) {
		console.error(err);
	}

	return null;
};

export type FavoritesAction = typeof action;
