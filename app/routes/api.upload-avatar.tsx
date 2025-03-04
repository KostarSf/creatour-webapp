import cuid2 from "@paralleldrive/cuid2";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, unstable_createFileUploadHandler } from "@remix-run/node";
import { unstable_parseMultipartFormData } from "@remix-run/node";
import {
	unstable_composeUploadHandlers,
	unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	const uploadHandler = unstable_composeUploadHandlers(
		unstable_createFileUploadHandler({
			directory: "public/avatars",
			avoidFileConflicts: true,
			file: ({ filename, name }) => {
				if (name !== "avatar") return undefined;

				const ext = filename.split(".").pop();
				const newName = `${cuid2.createId()}.${ext}`;
				return newName;
			},
		}),
		unstable_createMemoryUploadHandler(),
	);

	const form = await unstable_parseMultipartFormData(request, uploadHandler);

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

	return json({ error: null });
};

export type UploadAvatarAction = typeof action;
