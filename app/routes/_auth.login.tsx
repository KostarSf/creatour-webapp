import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
} from "react-router";
import type { MetaFunction } from "react-router";
import { Form, Link, useActionData, useSearchParams } from "react-router";
import { badRequest } from "~/utils/request.server";
import { createUserSession, getUser, login } from "~/utils/session.server";

export const meta: MetaFunction = () => [
	{ title: "Вход | Креатур" },
	{
		name: "description",
		content:
			"Войдите в систему, чтобы иметь возможность приобретать турпродукты!",
	},
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const redirectTo = url.searchParams.get("redirectTo") ?? "/user";

	const userData = await getUser(request);
	if (userData) {
		throw redirect(redirectTo);
	}

	return {};
};

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();

	const email = formData.get("email");
	const password = formData.get("password");

	const remember = Boolean(formData.get("remember"));
	const redirectTo = formData.get("redirectTo")?.toString() || "/user";

	if (typeof email !== "string" || typeof password !== "string") {
		return badRequest({
			fields: null,
			formError: "Форма неверно отправлена.",
		});
	}

	const fields = {
		email,
		password,
		remember,
	};

	const user = await login({ email, password });
	if (!user) {
		return badRequest({
			fields,
			formError: "Логин или пароль неверны.",
		});
	}

	return createUserSession(user.id, remember, redirectTo);
};

export default function LoginRoute() {
	const actionData = useActionData<typeof action>();
	const [searchParams] = useSearchParams();

	return (
		<>
			<div className="my-12 text-center md:my-16 md:text-left">
				<p className="font-medium text-3xl/relaxed tracking-widest md:text-4xl/relaxed">
					Мы скучали!
				</p>
				<p className="text-gray-800 leading-relaxed md:text-lg">
					Войдите, чтобы продолжить
				</p>
			</div>
			<Form method="POST">
				<input
					type="hidden"
					name="redirectTo"
					value={searchParams.get("redirectTo") ?? undefined}
				/>
				<div className="group relative w-full overflow-hidden rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 sm:w-80 lg:w-96">
					<input
						type="text"
						name="email"
						className="w-full px-4 py-3 outline-none"
						placeholder="Email"
						defaultValue={actionData?.fields?.email}
						required
					/>
				</div>
				<div className="group relative mt-2 w-full overflow-hidden rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 sm:w-80 lg:w-96">
					<input
						type="password"
						name="password"
						className="w-full px-4 py-3 outline-none"
						placeholder="Пароль"
						defaultValue={actionData?.fields?.password}
						required
					/>
				</div>
				<div className="mt-12 flex flex-wrap justify-between gap-2 md:mt-8">
					<div className="flex gap-2 align-middle">
						<input
							type="checkbox"
							name="remember"
							id="remember"
							className="cursor-pointer"
							defaultChecked={actionData?.fields?.remember}
						/>
						<label htmlFor="remember" className="cursor-pointer select-none">
							Запомнить меня
						</label>
					</div>
					{/* <Link
            to={`/forgot-password`}
            className='text-gray-500 hover:underline'
          >
            Забыли пароль?
          </Link> */}
				</div>
				<div className="mt-4 text-center md:mt-12 md:text-left">
					<button
						type="submit"
						className="w-full rounded-md bg-blue-500 px-14 py-3 font-medium text-white transition-colors hover:bg-blue-600 md:w-auto"
					>
						Войти
					</button>
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
