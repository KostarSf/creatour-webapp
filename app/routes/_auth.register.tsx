import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { type ActionFunctionArgs, Form, Link, redirect, useActionData, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { createUserSession, getUserSessionPayload, register } from "~/utils/session.server";

export const meta: MetaFunction = () => [
	{ title: "Регистрация | Креатур" },
	{
		name: "description",
		content: "Зарегистрируйтесь, и начните открывать новые направления!",
	},
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const redirectTo = url.searchParams.get("redirectTo") ?? "/user";

	const userData = await getUserSessionPayload(request);
	if (userData) {
		throw redirect(redirectTo);
	}

	return {};
};

function validateRole(role: unknown) {
	if (role !== "user" && role !== "placeowner" && role !== "creator" && role !== "admin") {
		return "Роль указана неверно";
	}
}

function validateUsername(username: unknown) {
	if (typeof username !== "string" || username.length < 3) {
		return "Имя должно содержать как минимум 3 символа";
	}
}

function validateEmail(email: unknown) {
	if (typeof email !== "string" || email.length < 3 || !email.includes("@")) {
		return "Неправильный Email адрес";
	}
}

function validatePassword(password: unknown) {
	if (typeof password !== "string" || password.length < 4) {
		return "Пароль должен содержать как минимум 4 символа";
	}
}

export const action = async ({ request }: ActionFunctionArgs) => {
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
			formError: "Форма неверно отправлена.",
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
			formError: "Такой Email уже занят",
		});
	}
	const user = await register({ username, email, password, role });
	if (!user) {
		return badRequest({
			fieldErrors: null,
			fields,
			formError: "Что-то пошло не так при создании пользователя.",
		});
	}
	return createUserSession(user, true, redirectTo);
};

export default function LoginRoute() {
	const actionData = useActionData<typeof action>();
	const [searchParams] = useSearchParams();

	return (
		<>
			<div className="my-12 text-center md:my-16 md:text-left">
				<p className="font-medium text-2xl tracking-widest md:text-3xl/relaxed">Добро пожаловать!</p>
				<p className="text-gray-800 leading-relaxed md:text-lg">
					Зарегистрируйтесь и начните <br /> открывать новые направления!
				</p>
			</div>
			<Form method="POST">
				<input type="hidden" name="redirectTo" value={searchParams.get("redirectTo") ?? undefined} />
				<Select
					name="role"
					required
					defaultValue={actionData?.fields?.role ?? "user"}
					aria-invalid={Boolean(actionData?.fieldErrors?.role)}
					aria-errormessage={actionData?.fieldErrors?.role ? "role-error" : undefined}
				>
					<SelectTrigger className="sm:w-80 lg:w-96">
						<SelectValue placeholder="Выберите роль" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="user">Пользователь</SelectItem>
						<SelectItem value="placeowner">Владелец ресурсов</SelectItem>
						<SelectItem value="creator">Создатель турпродуктов</SelectItem>
					</SelectContent>
				</Select>
				{actionData?.fieldErrors?.role ? (
					<p id="role-error" className="mt-1 mb-4 px-4 font-medium text-red-700 text-sm">
						{actionData.fieldErrors.role}
					</p>
				) : null}
				<Input
					type="text"
					name="username"
					autoComplete="name"
					placeholder="Имя"
					required
					className="mt-2 sm:w-80 lg:w-96"
					defaultValue={actionData?.fields?.username}
					aria-invalid={Boolean(actionData?.fieldErrors?.username)}
					aria-errormessage={actionData?.fieldErrors?.username ? "username-error" : undefined}
				/>
				{actionData?.fieldErrors?.username ? (
					<p id="username-error" className="mt-1 mb-4 px-4 font-medium text-red-700 text-sm">
						{actionData.fieldErrors.username}
					</p>
				) : null}
				<Input
					type="email"
					name="email"
					inputMode="email"
					autoComplete="email"
					placeholder="Email"
					required
					className="mt-2 sm:w-80 lg:w-96"
					defaultValue={actionData?.fields?.email}
					aria-invalid={Boolean(actionData?.fieldErrors?.email)}
					aria-errormessage={actionData?.fieldErrors?.email ? "email-error" : undefined}
				/>
				{actionData?.fieldErrors?.email ? (
					<p id="email-error" className="mt-1 mb-4 px-4 font-medium text-red-700 text-sm">
						{actionData.fieldErrors.email}
					</p>
				) : null}
				<Input
					type="password"
					name="password"
					className="mt-2 sm:w-80 lg:w-96"
					placeholder="Пароль"
					required
					defaultValue={actionData?.fields?.password}
					aria-invalid={Boolean(actionData?.fieldErrors?.password)}
					aria-errormessage={actionData?.fieldErrors?.password ? "password-error" : undefined}
				/>
				{actionData?.fieldErrors?.password ? (
					<p id="password-error" className="mt-1 mb-4 px-4 font-medium text-red-700 text-sm">
						{actionData.fieldErrors.password}
					</p>
				) : null}
				<div className="mt-2 flex items-center space-x-2 sm:w-80 lg:w-96">
					<Checkbox id="confirm-check" required />
					<Label htmlFor="confirm-check" className="inline">
						Я даю свое согласие на{" "}
						<Link
							to="/docs/privacy-policy.pdf"
							className="text-primary hover:underline"
							target="_blank"
						>
							обработку персональных данных
						</Link>
					</Label>
				</div>
				<div className="mt-12 text-center md:text-left">
					<Button type="submit" className="w-full md:w-auto" size="lg">
						Зарегистрироваться
					</Button>
					{actionData?.formError ? (
						<p className="mt-2 font-semibold text-red-700 text-sm" role="alert">
							{actionData.formError}
						</p>
					) : null}
				</div>
			</Form>
		</>
	);
}
