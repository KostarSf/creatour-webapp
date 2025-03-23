import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import cuid2 from "@paralleldrive/cuid2";
import type { ActionFunctionArgs } from "react-router";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { avatarsFileStorage } from "~/utils/storage.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	let avatarStorageKey: string | null = null;

	const uploadHandler = async (fileUpload: FileUpload) => {
		if (fileUpload.fieldName === "avatar" && fileUpload.type.startsWith("image/")) {
			avatarStorageKey = cuid2.createId();
			await avatarsFileStorage.set(avatarStorageKey, fileUpload);
			return avatarsFileStorage.get(avatarStorageKey);
		}
	};

	const form = await parseFormData(request, uploadHandler);

	const userId = form.get("userId");
	const avatar = form.get("avatar") as File | null;

	if (typeof userId !== "string" || !avatar || !avatarStorageKey) {
		return badRequest({
			error: "Форма неверно отправлена.",
		});
	}

	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user) {
		return badRequest({ error: "Такого пользователя не существует" });
	}

	console.log(avatar);

	await db.user.update({
		where: { id: userId },
		data: {
			avatar: `/api/uploads/avatars/${avatarStorageKey}`,
		},
	});

	return { error: null };
};

export type UploadAvatarAction = typeof action;
