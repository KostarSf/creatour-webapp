import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
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
			formError: "Форма неверно отправлена.",
		});
	}

	const fields = { redirectTo, id };

	const rating = await db.rating.findUnique({ where: { id } });
	if (!rating) {
		return badRequest({
			fieldErrors: null,
			fields: fields,
			formError: `Рейтинга с Id ${id} не существует.`,
		});
	}

	await db.rating.delete({ where: { id } });

	return redirect(redirectTo);
};
