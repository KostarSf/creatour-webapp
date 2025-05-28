import type { Route } from "./+types/api.create-product";

import { data } from "react-router";
import z from "zod";

import { USER_ROLES } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { requireRoleSession } from "~/utils/session.server";

const createPlaceSchema = z.object({
	creatorId: z.preprocess((arg) => (arg === "-" ? null : arg), z.uuid().nullable()),
	name: z.string(),
	tags: z.string().transform((tags) =>
		tags
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean),
	),
	short: z.string().optional(),
	description: z.string().optional(),
	city: z.string().optional(),
	address: z.string().optional(),
	coordinates: z.preprocess(
		(arg) =>
			arg === "" ? undefined : typeof arg === "string" ? arg.split(",").map((c) => c.trim()) : arg,
		z.array(z.coerce.number()).length(2).optional(),
	),
});

export const action = async ({ request }: Route.ActionArgs) => {
	await requireRoleSession(request, [USER_ROLES.admin.key, USER_ROLES.placeowner.key]);

	const formData = await request.formData();
	const result = createPlaceSchema.safeParse(Object.fromEntries(formData));

	if (!result.success) {
		return data({ success: false, errors: { detail: z.prettifyError(result.error) } }, 400);
	}

	const { tags, coordinates, ...placeDto } = result.data;

	await db.place.create({
		data: {
			...placeDto,
			coordinates: coordinates?.join(", ") ?? null,
			tags: {
				...(tags.length
					? {
							connectOrCreate: tags.map((tag) => ({
								where: { name: tag },
								create: { name: tag },
							})),
						}
					: {}),
			},
		},
	});

	return { success: true };
};
