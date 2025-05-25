import type { Route } from "./+types/api.create-user";

import { data } from "react-router";

import z from "zod";

import { USER_ROLES, USER_ROLES_LIST } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { requireRoleSession, sendNewAccountSetPasswordLink } from "~/utils/session.server";

const userSchema = z.object({
	username: z.string().min(1),
	role: z.enum(USER_ROLES_LIST.map((role) => role.key)),
	email: z.email(),
	age: z.coerce
		.number()
		.min(1)
		.pipe(z.int())
		.optional()
		.or(z.literal("").transform(() => null)),
	sex: z.preprocess((arg) => (arg === "" ? undefined : arg), z.enum(["-", "male", "female"]).optional()),
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

	const userExists = await db.user.findFirst({
		where: {
			email: result.data.email,
		},
	});
	if (userExists) {
		return data({ success: false, errors: { detail: "Данный Email уже занят" } }, 400);
	}

	const code = crypto.randomUUID();
	const newUser = await db.user.create({
		data: {
			...result.data,
			sex: result.data.sex === "-" ? null : result.data.sex,
			passwordHash: crypto.randomUUID(),
			recoverCode: code,
			activatedAt: new Date(),
		},
	});

	await sendNewAccountSetPasswordLink(newUser.id, code, newUser.email);

	return { success: true };
};
