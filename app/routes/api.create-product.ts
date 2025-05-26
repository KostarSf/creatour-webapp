import type { Route } from "./+types/api.create-product";

import { data } from "react-router";

import z from "zod";
import { PRODUCT_TYPES_LIST } from "~/lib/product-types";

import { USER_ROLES, USER_ROLES_LIST } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { requireRoleSession, sendNewAccountSetPasswordLink } from "~/utils/session.server";
import { getProductsStorageKey } from "~/utils/storage.server";

const updateProductSchema = z
	.object({
		creatorId: z.uuid(),
		type: z.enum(PRODUCT_TYPES_LIST.map((type) => type.key)),
		name: z.string(),
		tags: z.string().transform((tags) =>
			tags
				.split(",")
				.map((tag) => tag.trim())
				.filter(Boolean),
		),
		price: z.coerce.number().min(0),
		short: z.string().optional(),
		description: z.string().optional(),
		beginDate: z.coerce.date(),
		endDate: z.coerce.date(),
		city: z.string().optional(),
		address: z.string().optional(),
		coordinates: z.preprocess(
			(arg) =>
				arg === "" ? undefined : typeof arg === "string" ? arg.split(",").map((c) => c.trim()) : arg,
			z.array(z.coerce.number()).length(2).optional(),
		),
	})
	.refine((product) => product.beginDate.valueOf() <= product.endDate.valueOf());

export const action = async ({ request }: Route.ActionArgs) => {
	await requireRoleSession(request, USER_ROLES.admin.key);

	const formData = await request.formData();
	const result = updateProductSchema.safeParse(Object.fromEntries(formData));

	if (!result.success) {
		return data({ success: false, errors: { detail: z.prettifyError(result.error) } }, 400);
	}

	const { tags, coordinates, ...productDto } = result.data;

	await db.product.create({
		data: {
			...productDto,
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
