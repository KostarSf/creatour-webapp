import type { Route } from "./+types/api.rate-product";

import z from "zod";

import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export const action = async ({ request }: Route.ActionArgs) => {
	const userId = await requireUserId(request);

	const formData = await request.formData();
	const rating = z.coerce.number().min(0).max(5).pipe(z.int()).parse(formData.get("rating"));
	const productId = z.uuidv4().parse(formData.get("productId"));

	const existedRating = await db.rating.findFirst({
		where: { userId, productId },
	});

	if (rating === 0) {
		if (existedRating) {
			await db.rating.delete({ where: { id: existedRating.id } });
		}
		return { success: true };
	}

	if (existedRating) {
		await db.rating.update({
			where: { id: existedRating.id },
			data: { value: rating },
		});
		return { success: true };
	}

	await db.rating.create({
		data: {
			value: rating,
			productId: productId,
			userId: userId,
		},
	});
	return { success: true };
};

export type RateProductAction = typeof action;
