import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { requireUserId } from "~/utils/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);

	const form = await request.formData();
	const commentId = form.get("commentId");
	const redirectTo = form.get("redirect-to")?.toString() || "/products";
	if (typeof commentId !== "string") {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: "Форма неверно отправлена.",
		});
	}

	const comment = await db.comment.findUnique({
		where: {
			id: commentId,
		},
	});

	if (!comment) {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: `Комментария с ID ${commentId} не существует.`,
		});
	}

	if (comment.userId !== userId) {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: "Вы не можете удалить чужой комментарий.",
		});
	}

	await db.comment.delete({
		where: {
			id: commentId,
		},
	});

	return redirect(redirectTo);
};
