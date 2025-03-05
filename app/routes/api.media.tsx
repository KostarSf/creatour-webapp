import { unlink } from "node:fs/promises";
import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import cuid2 from "@paralleldrive/cuid2";
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { mediaFileStorage } from "~/utils/storage.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	if (request.method === "POST") {
		let mediaName = "";
		let mediaType = "";

		const uploadHandler = async (fileUpload: FileUpload) => {
			const ext = fileUpload.name.split(".").pop();
			mediaType = ext === "mp4" || ext === "webm" ? "video" : "image";
			const storageKey = `${cuid2.createId()}.${ext}`;
			mediaName = storageKey;
			await mediaFileStorage.set(storageKey, fileUpload);
			return mediaFileStorage.get(storageKey);
		};

		const form = await parseFormData(request, uploadHandler);

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
				formError: "Форма неверно отправлена.",
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
		}
		if (parentType === "place") {
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
	}
	if (request.method === "DELETE") {
		const form = await request.formData();

		const redirectTo = form.get("redirectTo");
		const id = form.get("id");

		if (typeof redirectTo !== "string" || typeof id !== "string") {
			return badRequest({
				fieldErrors: null,
				fields: null,
				formError: "Форма неверно отправлена.",
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
