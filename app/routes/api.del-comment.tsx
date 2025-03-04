import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

export const action = async ({ request }: ActionFunctionArgs) => {
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

	const comment = await db.comment.findUnique({
		where: { id },
		include: { media: true },
	});
	if (!comment) {
		return badRequest({
			fieldErrors: null,
			fields: fields,
			formError: `Комментария с Id ${id} не существует.`,
		});
	}

	await db.comment.delete({ where: { id } });

	return redirect(redirectTo);
};
