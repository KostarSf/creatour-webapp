import type { Route } from "./+types/api.delete-product";

import { data } from "react-router";

import { USER_ROLES } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { requireRoleSession } from "~/utils/session.server";

export const action = async ({ request }: Route.ActionArgs) => {
	await requireRoleSession(request, USER_ROLES.admin.key);

	const formData = await request.formData();
	const productId = formData.get("productId");

	if (typeof productId !== "string" || productId.length < 1) {
		return data({ success: false }, 400);
	}

	await db.product.delete({ where: { id: productId } });

	return { success: true };
};
