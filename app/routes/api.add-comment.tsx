import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import cuid2 from "@paralleldrive/cuid2";
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { mediaFileStorage } from "~/utils/storage";

type Media = {
	name: string;
	type: "image" | "video";
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const mediafiles: Media[] = [];

	const uploadHandler = async (fileUpload: FileUpload) => {
		const ext = fileUpload.name.split(".").pop();
		const type = ext === "mp4" || ext === "webm" ? "video" : "image";
		const storageKey = `${cuid2.createId()}.${ext}`;
		await mediaFileStorage.set(storageKey, fileUpload);
		mediafiles.push({ name: storageKey, type });
		return mediaFileStorage.get(storageKey);
	};

	const form = await parseFormData(request, uploadHandler);

	const redirectTo = form.get("redirectTo");
	const parentType = form.get("parentType");
	const parentId = form.get("parentId");
	const userId = form.get("userId");
	const text = form.get("text");

	if (
		typeof redirectTo !== "string" ||
		typeof parentType !== "string" ||
		typeof parentId !== "string" ||
		typeof userId !== "string" ||
		typeof text !== "string"
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
		userId,
		text: text.trim(),
	};

	if (parentType !== "product" && parentType !== "place") {
		return badRequest({
			fieldErrors: null,
			fields: fields,
			formError: `Неверный тип родителя комментария - ${parentType}.`,
		});
	}

	if (fields.text === "") {
		return badRequest({
			fieldErrors: null,
			fields: fields,
			formError: "Комментарий не может быть пустым",
		});
	}

	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user) {
		return badRequest({
			fieldErrors: null,
			fields: fields,
			formError: `Пользователя с Id ${userId} не существует.`,
		});
	}

	if (parentType === "place") {
		const place = await db.place.findUnique({ where: { id: parentId } });
		if (!place) {
			return badRequest({
				fieldErrors: null,
				fields: fields,
				formError: `Места с Id ${userId} не существует.`,
			});
		}
	} else {
		const product = await db.product.findUnique({ where: { id: parentId } });
		if (!product) {
			return badRequest({
				fieldErrors: null,
				fields: fields,
				formError: `Турпродукта с Id ${userId} не существует.`,
			});
		}
	}

	const comment = await db.comment.create({
		data: {
			userId,
			text,
			placeId: parentType === "place" ? parentId : null,
			productId: parentType === "product" ? parentId : null,
		},
	});
	if (!comment) {
		return new Response("Ошибка", { status: 500 });
	}

	mediafiles.map(async (media) => {
		await db.media.create({
			data: {
				type: media.type,
				url: `/media/${media.name}`,
				community: true,
				comments: {
					connect: { id: comment.id },
				},
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
	});

	return redirect(redirectTo);
};
