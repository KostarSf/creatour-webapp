import type { Route } from "./+types/api.send-confirmation-email";

import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { requireUserId, sendActivateLink } from "~/utils/session.server";

export const action = async ({ request }: Route.ActionArgs) => {
	const userId = await requireUserId(request, "/login");

	const user = await db.user.findUnique({
		where: {
			id: userId,
			activatedAt: null,
		},
	});

	if (!user) {
		return badRequest({
			success: false,
			detail: "Невозможно послать код подтверждения для данного аккаунта",
		});
	}

	const code = String(Math.floor(100000 + Math.random() * 900000));
	try {
		await db.user.update({ where: { id: user.id }, data: { activateCode: code } });
		await sendActivateLink(user.id, code, user.email);
	} catch (err) {
		await db.user.update({ where: { id: user.id }, data: { activateCode: null } });

		console.log(err);

		return badRequest({
			success: false,
			detail: "Не удалось отправить письмо подтверждения",
		});
	}

	return { success: true, detail: undefined };
};

export type SendConfirmationEmailAction = typeof action;
