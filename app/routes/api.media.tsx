import cuid2 from "@paralleldrive/cuid2";
import type { ActionArgs } from "@remix-run/node";
import { unstable_parseMultipartFormData } from "@remix-run/node";
import {
	unstable_composeUploadHandlers,
	unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createFileUploadHandler } from "@remix-run/node/dist/upload/fileUploadHandler";
import { unlink } from "fs/promises";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

export const action = async ({ request }: ActionArgs) => {
	if (request.method === "POST") {
		let mediaName = "";
		let mediaType = "";

		const uploadHandler = unstable_composeUploadHandlers(
			createFileUploadHandler({
				directory: "public/media",
				avoidFileConflicts: true,
				file: ({ filename }) => {
					const ext = filename.split(".").pop();
					mediaType = ext === "mp4" || ext === "webm" ? "video" : "image";
					const newName = `${cuid2.createId()}.${ext}`;
					mediaName = newName;
					return newName;
				},
			}),
			unstable_createMemoryUploadHandler(),
		);

		const form = await unstable_parseMultipartFormData(request, uploadHandler);

		const redirectTo = form.get("redirectTo");
		const parentType = form.get("parentType");
		const parentId = form.get("parentId");
		const name = form.get("name");
		const description = form.get("description");

		if (
			typeof redirectTo !== "string" ||
			typeof parentType !== "string" ||
			typeof parentId !== "string" ||
			typeof name !== "string" ||
			typeof description !== "string"
		) {
			return badRequest({
				fieldErrors: null,
				fields: null,
				formError: `Форма неверно отправлена.`,
			});
		}

		const fields = {
			redirectTo,
			parentType,
			parentId,
			name,
			description,
		};

		if (parentType !== "product" && parentType !== "place") {
			return badRequest({
				fieldErrors: null,
				fields: fields,
				formError: `Неверный тип родителя медиа - ${parentType}.`,
			});
		} else if (parentType === "place") {
			const place = await db.place.findUnique({ where: { id: parentId } });
			if (!place) {
				return badRequest({
					fieldErrors: null,
					fields: fields,
					formError: `Места с Id ${parentId} не существует.`,
				});
			}
		} else {
			const product = await db.product.findUnique({ where: { id: parentId } });
			if (!product) {
				return badRequest({
					fieldErrors: null,
					fields: fields,
					formError: `Турпродукта с Id ${parentId} не существует.`,
				});
			}
		}

		await db.media.create({
			data: {
				type: mediaType,
				url: `/media/${mediaName}`,
				name: name ?? null,
				description: description ?? null,
				places: {
					connect:
						parentType === "place"
							? {
									id: parentId,
								}
							: undefined,
				},
				products: {
					connect:
						parentType === "product"
							? {
									id: parentId,
								}
							: undefined,
				},
			},
		});

		return redirect(redirectTo);
	} else if (request.method === "DELETE") {
		const form = await request.formData();

		const redirectTo = form.get("redirectTo");
		const id = form.get("id");

		if (typeof redirectTo !== "string" || typeof id !== "string") {
			return badRequest({
				fieldErrors: null,
				fields: null,
				formError: `Форма неверно отправлена.`,
			});
		}

		const fields = { redirectTo, id };

		const media = await db.media.findUnique({ where: { id } });
		if (!media) {
			return badRequest({
				fieldErrors: null,
				fields: fields,
				formError: `Медиа с Id ${id} не существует.`,
			});
		}

		await unlink(`public/${media.url}`);
		await db.media.delete({ where: { id } });

		return redirect(redirectTo);
	}
};
