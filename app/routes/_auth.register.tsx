import type { LoaderArgs } from "@remix-run/node";
import { redirect, type ActionArgs } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/react";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { createUserSession, getUser, register } from "~/utils/session.server";

export const meta: V2_MetaFunction = () => [
	{ title: "Регистрация | Креатур" },
	{
		name: "description",
		content: "Зарегистрируйтесь, и начните открывать новые направления!",
	},
];

export const loader = async ({ request }: LoaderArgs) => {
	const url = new URL(request.url);
	const redirectTo = url.searchParams.get("redirectTo") ?? "/user";

	const userData = await getUser(request);
	if (userData) {
		throw redirect(redirectTo);
	}

	return {};
};

function validateRole(role: unknown) {
	if (
		role !== "user" &&
		role !== "placeowner" &&
		role !== "creator" &&
		role !== "admin"
	) {
		return `Роль указана неверно`;
	}
}

function validateUsername(username: unknown) {
	if (typeof username !== "string" || username.length < 3) {
		return `Имя должно содержать как минимум 3 символа`;
	}
}

function validateEmail(email: unknown) {
	if (typeof email !== "string" || email.length < 3 || !email.includes("@")) {
		return `Неправильный Email адрес`;
	}
}

function validatePassword(password: unknown) {
	if (typeof password !== "string" || password.length < 4) {
		return `Пароль должен содержать как минимум 4 символа`;
	}
}

export const action = async ({ request }: ActionArgs) => {
	const formData = await request.formData();

	const role = formData.get("role");
	const username = formData.get("username");
	const email = formData.get("email");
	const password = formData.get("password");
	const redirectTo = formData.get("redirectTo")?.toString() || "/user";

	if (
		typeof role !== "string" ||
		typeof username !== "string" ||
		typeof email !== "string" ||
		typeof password !== "string"
	) {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: `Форма неверно отправлена.`,
		});
	}

	const fields = {
		role,
		username,
		email,
		password,
	};
	const fieldErrors = {
		role: validateRole(role),
		username: validateUsername(username),
		email: validateEmail(email),
		password: validatePassword(password),
	};
	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields, formError: null });
	}

	const userExists = await db.user.findUnique({ where: { email } });
	if (userExists) {
		return badRequest({
			fieldErrors: null,
			fields,
			formError: `Такой Email уже занят`,
		});
	}
	const user = await register({ username, email, password, role });
	if (!user) {
		return badRequest({
			fieldErrors: null,
			fields,
			formError: `Что-то пошло не так при создании пользователя.`,
		});
	}
	return createUserSession(user.id, true, redirectTo);
};

export default function LoginRoute() {
	const actionData = useActionData<typeof action>();
	const [searchParams] = useSearchParams();

	return (
		<>
			<div className="my-12 md:my-16 text-center md:text-left">
				<p className="text-2xl md:text-3xl/relaxed font-medium tracking-widest">
					Добро пожаловать!
				</p>
				<p className="md:text-lg leading-relaxed text-gray-800">
					Зарегистрируйтесь и начните <br /> открывать новые направления!
				</p>
			</div>
			<Form method="POST">
				<input
					type="hidden"
					name="redirectTo"
					value={searchParams.get("redirectTo") ?? undefined}
				/>
				<div className="group relative w-full overflow-hidden rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 sm:w-80 lg:w-96">
					<select
						className="w-full px-4 py-3 outline-none bg-white"
						name="role"
						required
						defaultValue={actionData?.fields?.role}
						aria-invalid={Boolean(actionData?.fieldErrors?.role)}
						aria-errormessage={
							actionData?.fieldErrors?.role ? "role-error" : undefined
						}
					>
						<option value="user">Пользователь</option>
						<option value="placeowner">Владелец ресурсов</option>
						<option value="creator">Создатель турпродуктов</option>
					</select>
				</div>
				{actionData?.fieldErrors?.role ? (
					<p
						id="role-error"
						className="text-red-700 px-4 font-medium mt-1 mb-4 text-sm"
					>
						{actionData.fieldErrors.role}
					</p>
				) : null}
				<div className="group relative mt-2 w-full overflow-hidden rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 sm:w-80 lg:w-96">
					<input
						type="text"
						name="username"
						className="w-full px-4 py-3 outline-none"
						placeholder="Имя"
						required
						defaultValue={actionData?.fields?.username}
						aria-invalid={Boolean(actionData?.fieldErrors?.username)}
						aria-errormessage={
							actionData?.fieldErrors?.username ? "username-error" : undefined
						}
					/>
				</div>
				{actionData?.fieldErrors?.username ? (
					<p
						id="username-error"
						className="text-red-700 px-4 font-medium mt-1 mb-4 text-sm"
					>
						{actionData.fieldErrors.username}
					</p>
				) : null}
				<div className="group relative mt-2 w-full rounded-md overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 sm:w-80 lg:w-96">
					<input
						type="email"
						name="email"
						className="w-full px-4 py-3 outline-none"
						placeholder="Email"
						required
						defaultValue={actionData?.fields?.email}
						aria-invalid={Boolean(actionData?.fieldErrors?.email)}
						aria-errormessage={
							actionData?.fieldErrors?.email ? "email-error" : undefined
						}
					/>
				</div>
				{actionData?.fieldErrors?.email ? (
					<p
						id="email-error"
						className="text-red-700 px-4 font-medium mt-1 mb-4 text-sm"
					>
						{actionData.fieldErrors.email}
					</p>
				) : null}
				<div className="group relative mt-2 w-full rounded-md overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 sm:w-80 lg:w-96">
					<input
						type="password"
						name="password"
						className="w-full px-4 py-3 outline-none"
						placeholder="Пароль"
						required
						defaultValue={actionData?.fields?.password}
						aria-invalid={Boolean(actionData?.fieldErrors?.password)}
						aria-errormessage={
							actionData?.fieldErrors?.password ? "password-error" : undefined
						}
					/>
				</div>
				{actionData?.fieldErrors?.password ? (
					<p
						id="password-error"
						className="text-red-700 px-4 font-medium mt-1 mb-4 text-sm"
					>
						{actionData.fieldErrors.password}
					</p>
				) : null}
				<div className="mt-4 md:mt-12 text-center md:text-left">
					<button
						type="submit"
						className="w-full rounded-md bg-blue-500 px-14 py-3 font-medium text-white transition-colors hover:bg-blue-600 md:w-auto"
					>
						Зарегистрироваться
					</button>
					{actionData?.formError ? (
						<p className="text-sm font-semibold text-red-700 mt-2" role="alert">
							{actionData.formError}
						</p>
					) : null}
				</div>
			</Form>
		</>
	);
}
