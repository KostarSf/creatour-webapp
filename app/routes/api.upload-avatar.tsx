import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import cuid2 from "@paralleldrive/cuid2";
import type { ActionFunctionArgs } from "react-router";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { avatarsFileStorage } from "~/utils/storage";

export const action = async ({ request }: ActionFunctionArgs) => {
	const uploadHandler = async (fileUpload: FileUpload) => {
		if (
			fileUpload.fieldName === "avatar" &&
			fileUpload.type.startsWith("image/")
		) {
			const ext = fileUpload.name.split(".").pop();
			const storageKey = `${cuid2.createId()}.${ext}`;
			await avatarsFileStorage.set(storageKey, fileUpload);
			return avatarsFileStorage.get(storageKey);
		}
	};

	const form = await parseFormData(request, uploadHandler);

	const userId = form.get("userId");
	const avatar = form.get("avatar") as File;

	console.log({ userId, avatar });

	if (typeof userId !== "string") {
		return badRequest({
			error: "Форма неверно отправлена.",
		});
	}

	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user) return badRequest({ error: "Такого пользователя не существует" });

	await db.user.update({
		where: { id: userId },
		data: {
			avatar: `/avatars/${avatar.name}`,
		},
	});

	return { error: null };
};

export type UploadAvatarAction = typeof action;
