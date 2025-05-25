import type { ActionFunctionArgs, MetaFunction } from "react-router";
import { Link, useActionData, useSearchParams } from "react-router";

import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { createUserSession, login, register } from "~/utils/session.server";

import { useState } from "react";
import { USER_ROLES, USER_ROLES_LIST } from "~/lib/user-roles";

export const meta: MetaFunction = () => [
	{ title: "Креатур | Вход" },
	{
		name: "description",
		content: "Войдите в систему, чтобы иметь возможность приобретать турпродукты!",
	},
];

function validateUsername(username: unknown) {
	if (typeof username !== "string" || username.length < 3) {
		return "Имя пользователя должно содержать как минимум 3 символа";
	}
}

function validatePassword(password: unknown) {
	if (typeof password !== "string" || password.length < 4) {
		return "Пароль должен содержать как минимум 4 символа";
	}
}

export const action = async ({ request }: ActionFunctionArgs) => {
	const form = await request.formData();
	const loginType = form.get("loginType");
	const role = form.get("role");
	const username = form.get("username");
	const password = form.get("password");
	const redirectTo = form.get("redirectTo")?.toString() || "/user";
	console.log(role);
	if (
		typeof loginType !== "string" ||
		typeof username !== "string" ||
		typeof password !== "string" ||
		typeof redirectTo !== "string"
	) {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: "Форма неверно отправлена.",
		});
	}

	const fields = {
		loginType,
		username,
		password,
		role: typeof role === "string" ? role : USER_ROLES.user.key,
	};
	const fieldErrors = {
		username: validateUsername(username),
		password: validatePassword(password),
	};
	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields, formError: null });
	}

	switch (loginType) {
		case "login": {
			const user = await login({ password, username });
			if (!user) {
				return badRequest({
					fieldErrors: null,
					fields,
					formError: "Логин или пароль неверны.",
				});
			}
			return createUserSession(user.id, redirectTo);
		}
		case "register": {
			const userExists = await db.user.findFirst({ where: { username } });
			if (userExists) {
				return badRequest({
					fieldErrors: null,
					fields,
					formError: `Пользователь с именем ${username} уже существует`,
				});
			}
			const user = await register({ username, password });
			if (!user) {
				return badRequest({
					fieldErrors: null,
					fields,
					formError: "Что-то пошло не так при создании пользователя.",
				});
			}
			await db.user.update({
				where: { id: user.id },
				data: { role: fields.role },
			});
			return createUserSession(user, false, redirectTo);
		}
		default: {
			return badRequest({
				fieldErrors: null,
				fields,
				formError: "Неверный тип логина.",
			});
		}
	}
};

export default function Login() {
	const actionData = useActionData<typeof action>();
	const [searchParams] = useSearchParams();

	const [hideRole, setHideRole] = useState(
		!actionData?.fields?.loginType || actionData?.fields?.loginType === "login",
	);

	return (
		<div className="flex h-screen w-screen flex-col items-center justify-center py-4">
			<div className="flex flex-col items-center" data-light="">
				<h1 className="mb-10 font-serif text-4xl">Вход в Креатур</h1>
				<form method="post" className=" flex flex-col items-center">
					<input
						type="hidden"
						name="redirectTo"
						value={searchParams.get("redirectTo") ?? undefined}
					/>
					<fieldset className="mb-4 flex gap-6">
						<legend className="sr-only">Вход или Регистрация?</legend>
						<label className="text-lg">
							<input
								type="radio"
								name="loginType"
								value="login"
								defaultChecked={
									!actionData?.fields?.loginType ||
									actionData?.fields?.loginType === "login"
								}
								onChange={(e) => setHideRole(true)}
							/>{" "}
							Вход
						</label>
						<label className="text-lg">
							<input
								type="radio"
								name="loginType"
								value="register"
								defaultChecked={actionData?.fields?.loginType === "register"}
								onChange={(e) => setHideRole(false)}
							/>{" "}
							Регистрация
						</label>
					</fieldset>
					{!hideRole ? (
						<div className="mb-4 w-60">
							<label
								htmlFor="role-input"
								className="block font-semibold text-slate-700 text-sm"
							>
								Тип аккаунта
							</label>
							<select
								className="block w-full border border-slate-500 px-3 py-1"
								name="role"
								id="role-input"
								defaultValue={actionData?.fields?.role}
							>
								{USER_ROLES_LIST.map((role) => (
									<option key={role.key} value={role.key}>
										{role.title}
									</option>
								))}
							</select>
						</div>
					) : null}
					<div className="w-60">
						<label
							htmlFor="username-input"
							className="block font-semibold text-slate-700 text-sm"
						>
							Имя пользователя
						</label>
						<input
							className="block w-full border border-slate-500 px-3 py-1"
							type="text"
							id="username-input"
							name="username"
							defaultValue={actionData?.fields?.username}
							aria-invalid={Boolean(actionData?.fieldErrors?.username)}
							aria-errormessage={
								actionData?.fieldErrors?.username ? "username-error" : undefined
							}
						/>
						{actionData?.fieldErrors?.username ? (
							<p
								className="font-semibold text-red-700 text-sm"
								role="alert"
								id="username-error"
							>
								{actionData.fieldErrors.username}
							</p>
						) : null}
					</div>
					<div className="mt-4 w-60">
						<label
							htmlFor="password-input"
							className="block font-semibold text-slate-700 text-sm"
						>
							Пароль
						</label>
						<input
							className="block w-full border border-slate-500 px-3 py-1"
							id="password-input"
							name="password"
							defaultValue={actionData?.fields?.password}
							type="password"
							aria-invalid={Boolean(actionData?.fieldErrors?.password)}
							aria-errormessage={
								actionData?.fieldErrors?.password ? "password-error" : undefined
							}
						/>
						{actionData?.fieldErrors?.password ? (
							<p
								className="font-semibold text-red-700 text-sm"
								role="alert"
								id="password-error"
							>
								{actionData.fieldErrors.password}
							</p>
						) : null}
					</div>
					<div id="form-error-message">
						{actionData?.formError ? (
							<p className="font-semibold text-red-700 text-sm" role="alert">
								{actionData.formError}
							</p>
						) : null}
					</div>
					<button
						type="submit"
						className="mt-8 inline-block rounded-sm bg-blue-600 px-4 py-1 text-center font-semibold text-lg text-white"
					>
						Отправить
					</button>
				</form>
			</div>
			<div className="mt-12">
				<ul className="flex gap-4">
					<li>
						<Link to="/" className="text-blue-600 hover:underline">
							Креатур
						</Link>
					</li>
					<li>
						<Link to="/products" className="text-blue-600 hover:underline">
							Турпродукты
						</Link>
					</li>
				</ul>
			</div>
		</div>
	);
}
