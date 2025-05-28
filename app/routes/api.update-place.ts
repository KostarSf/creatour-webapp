import type { Route } from "./+types/api.update-place";

import { data } from "react-router";
import z from "zod";

import { USER_ROLES } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { dHash } from "~/utils/hamming-distance.server";
import { requireRoleSession } from "~/utils/session.server";
import { getPlacesStorageKey, placesFileStorage } from "~/utils/storage.server";

const updatePlaceSchema = z.object({
	id: z.uuid(),
	newImage: z.preprocess(
		(arg) => (arg instanceof File && arg.size === 0 ? undefined : arg),
		z
			.file()
			.optional()
			.refine((image) => !image || image.type.startsWith("image/")),
	),
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
	const result = updatePlaceSchema.safeParse(Object.fromEntries(formData));

	if (!result.success) {
		return data({ success: false, errors: { detail: z.prettifyError(result.error) } }, 400);
	}

	const { id, newImage, tags, coordinates, ...placeDto } = result.data;

	let imageName = "";
	let imageDhash: string | undefined = undefined;
	if (newImage) {
		const storageKey = getPlacesStorageKey(id, newImage.name);
		await placesFileStorage.set(storageKey, newImage);
		imageName = storageKey;
		imageDhash = await dHash(await newImage.bytes());
	}

	const placeToUpdate = await db.place.findUnique({ where: { id } });
	if (!placeToUpdate) {
		return data({ success: false, errors: { detail: "Объект не найден" } }, 400);
	}

	await db.place.update({
		where: { id },
		data: {
			...placeDto,
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
