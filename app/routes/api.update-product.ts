import { data } from "react-router";
import z from "zod";
import { PRODUCT_TYPES_LIST } from "~/lib/product-types";
import { USER_ROLES } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { dHash } from "~/utils/hamming-distance.server";
import { requireRoleSession } from "~/utils/session.server";
import { getProductsStorageKey, productsFileStorage } from "~/utils/storage.server";
import type { Route } from "./+types/api.update-product";

const updateProductSchema = z
	.object({
		id: z.uuid(),
		newImage: z.preprocess(
			(arg) => (arg instanceof File && arg.size === 0 ? undefined : arg),
			z
				.file()
				.optional()
				.refine((image) => !image || image.type.startsWith("image/")),
		),
		active: z.coerce.boolean(),
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
	await requireRoleSession(request, [USER_ROLES.admin.key, USER_ROLES.creator.key]);

	const formData = await request.formData();
	const result = updateProductSchema.safeParse(Object.fromEntries(formData));

	if (!result.success) {
		return data({ success: false, errors: { detail: z.prettifyError(result.error) } }, 400);
	}

	const { id, newImage, tags, coordinates, ...productDto } = result.data;

	let imageName = "";
	let imageDhash: string | undefined = undefined;
	if (newImage) {
		const storageKey = getProductsStorageKey(id, newImage.name);
		await productsFileStorage.set(storageKey, newImage);
		imageName = storageKey;
		imageDhash = await dHash(await newImage.bytes());
	}

	const productToUpdate = await db.product.findUnique({ where: { id } });
	if (!productToUpdate) {
		return data({ success: false, errors: { detail: "Турпродукт не найден" } }, 400);
	}

	await db.product.update({
		where: { id },
		data: {
			...productDto,
			coordinates: coordinates?.join(", ") ?? null,
			tags: {
				set: [],
				...(tags.length
					? {
							connectOrCreate: tags.map((tag) => ({
								where: { name: tag },
								create: { name: tag },
							})),
						}
					: {}),
			},
			...(imageName ? { image: imageName } : {}),
			...(imageDhash ? { imageDhash } : {}),
		},
	});

	return { success: true };
};
