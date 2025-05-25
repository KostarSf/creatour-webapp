import { data } from "react-router";
import type { Route } from "./+types/api.update-user";

import z from "zod";

import { USER_ROLES, USER_ROLES_LIST } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { requireRoleSession } from "~/utils/session.server";

const userSchema = z.object({
	id: z.string(),
	username: z.string().min(1),
	role: z.enum(USER_ROLES_LIST.map((role) => role.key)),
	email: z.email(),
	sex: z.preprocess((arg) => (arg === "" ? undefined : arg), z.enum(["-", "male", "female"]).optional()),
	age: z.coerce
		.number()
		.min(1)
		.pipe(z.int())
		.optional()
		.or(z.literal("").transform(() => null)),
	phone: z.string().optional(),
	city: z.string().optional(),
	address: z.string().optional(),
	inn: z.string().optional(),
	legalName: z.string().optional(),
});

export const action = async ({ request }: Route.ActionArgs) => {
	await requireRoleSession(request, USER_ROLES.admin.key);

	const formData = await request.formData();
	const result = userSchema.safeParse(Object.fromEntries(formData));

	if (!result.success) {
		return data({ success: false, errors: { detail: z.prettifyError(result.error) } }, 400);
	}

	const { id, sex, ...userDto } = result.data;

	const userToUpdate = await db.user.findUnique({ where: { id } });
	if (!userToUpdate) {
		return data({ success: false, errors: { detail: "Пользователь не найден" } }, 400);
	}

	await db.user.update({
		where: { id },
		data: { ...userDto, sex: sex === "-" ? null : sex },
	});

	return { success: true };
};
