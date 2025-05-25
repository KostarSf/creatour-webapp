import { data } from "react-router";
import { USER_ROLES } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { requireRoleSession } from "~/utils/session.server";
import type { Route } from "./+types/api.delete-user";

export const action = async ({ request }: Route.ActionArgs) => {
	const session = await requireRoleSession(request, USER_ROLES.admin.key);

	const formData = await request.formData();
	const userId = formData.get("userId");

	if (typeof userId !== "string" || userId.length < 1) {
		return data({ success: false }, 400);
	}

	if (session.id === userId) {
		return data({ success: false, errors: { detail: "Нельзя удалить себя" } }, 400);
	}

	await db.user.delete({ where: { id: userId } });

	return { success: true };
};
