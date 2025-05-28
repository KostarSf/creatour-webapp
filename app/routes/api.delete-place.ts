import type { Route } from "./+types/api.delete-place";

import { data } from "react-router";

import { USER_ROLES } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { requireRoleSession } from "~/utils/session.server";

export const action = async ({ request }: Route.ActionArgs) => {
	await requireRoleSession(request, [USER_ROLES.admin.key, USER_ROLES.placeowner.key]);

	const formData = await request.formData();
	const placeId = formData.get("placeId");

	if (typeof placeId !== "string" || placeId.length < 1) {
		return data({ success: false }, 400);
	}

	await db.place.delete({ where: { id: placeId } });

	return { success: true };
};
