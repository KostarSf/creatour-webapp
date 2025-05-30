import { LoaderCircleIcon } from "lucide-react";
import type { MetaFunction } from "react-router";
import {
	type ActionFunctionArgs,
	Form,
	Link,
	type LoaderFunctionArgs,
	href,
	redirect,
	useActionData,
	useNavigation,
	useSearchParams,
} from "react-router";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { badRequest } from "~/utils/request.server";
import { createUserSession, getUserSessionPayload, login } from "~/utils/session.server";

export const meta: MetaFunction = () => [
	{ title: "Вход | Креатур" },
	{
		name: "description",
		content: "Войдите в систему, чтобы иметь возможность приобретать турпродукты!",
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

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();

	const email = formData.get("email");
	const password = formData.get("password");

	const remember = Boolean(formData.get("remember"));
	const redirectTo = formData.get("redirectTo")?.toString() || href("/products");

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

	return createUserSession(user, remember, redirectTo);
};

export default function LoginRoute() {
	const actionData = useActionData<typeof action>();
	const [searchParams] = useSearchParams();

	const navigation = useNavigation();
	const pending = !!navigation.formData;

	return (
		<>
			<div className="my-12 text-center md:my-16 md:text-left">
				<p className="font-medium text-3xl/relaxed tracking-widest md:text-4xl/relaxed">
					Мы скучали!
				</p>
				<p className="text-gray-800 leading-relaxed md:text-lg">Войдите, чтобы продолжить</p>
			</div>
			<Form method="POST">
				<input type="hidden" name="redirectTo" value={searchParams.get("redirectTo") ?? undefined} />
				<Input
					type="text"
					name="email"
					autoComplete="email"
					inputMode="email"
					className="sm:w-80 lg:w-96"
					placeholder="Email"
					defaultValue={actionData?.fields?.email}
					required
				/>
				<Input
					type="password"
					name="password"
					className="mt-2 sm:w-80 lg:w-96"
					placeholder="Пароль"
					defaultValue={actionData?.fields?.password}
					required
				/>
				<div className="flex justify-end">
					<Link to={href("/recover")} className="mt-2 text-primary text-sm/none hover:underline">
						Забыли пароль?
					</Link>
				</div>
				<div className="mt-2 flex items-center space-x-2 sm:w-80 lg:w-96">
					<Checkbox id="remember" name="remember" defaultChecked={actionData?.fields?.remember} />
					<Label htmlFor="remember">Запомнить меня</Label>
				</div>
				<div className="mt-12 text-center md:text-left">
					<Button type="submit" className="w-full md:w-48" size="lg" disabled={pending}>
						{pending ? <LoaderCircleIcon className="animate-spin" /> : "Войти "}
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
