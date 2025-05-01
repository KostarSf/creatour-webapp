import type { Route } from "./+types/_auth.reset-password";

import bcrypt from "bcryptjs";
import { LoaderCircleIcon } from "lucide-react";
import { Form, href, redirect, useNavigation } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
	const searchParams = new URL(request.url).searchParams;
	const userId = searchParams.get("id") as string;
	const code = searchParams.get("code") as string;

	const user = await db.user.findFirst({
		where: { id: userId, recoverCode: code },
	});

	if (!user) {
		throw new Response("Невалидная ссылка восстановления пароля", { status: 400 });
	}

	return { email: user.email };
};

export const action = async ({ request }: Route.ActionArgs) => {
	const searchParams = new URL(request.url).searchParams;
	const userId = searchParams.get("id") as string;
	const code = searchParams.get("code") as string;

	const user = await db.user.findFirst({
		where: { id: userId, recoverCode: code },
	});

	if (!user) {
		throw new Response("Невалидная ссылка восстановления пароля", { status: 400 });
	}

	const formData = await request.formData();
	const password = formData.get("password");
	const passwordRepeat = formData.get("password-repeat");

	if (typeof password !== "string" || typeof passwordRepeat !== "string") {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: "Форма неверно отправлена.",
		});
	}

	const fields = {
		password,
		passwordRepeat,
	};

	if (password !== passwordRepeat) {
		return badRequest({
			fieldErrors: null,
			fields: fields,
			formError: "Пароли не совпадают",
		});
	}

	const passwordHash = await bcrypt.hash(password, 10);
	await db.user.update({
		where: { id: user.id },
		data: {
			recoverCode: null,
			passwordHash: passwordHash,
		},
	});

	return redirect(href("/login"));
};

export default function ResetPassordPage({ actionData, loaderData }: Route.ComponentProps) {
	const navigation = useNavigation();
	const pending = !!navigation.formData;

	return (
		<>
			<div className="my-12 text-center md:my-16 md:text-left">
				<p className="font-medium text-3xl/relaxed tracking-widest md:text-4xl/relaxed">
					Восстановление
				</p>
				<p className="text-gray-800 leading-relaxed md:text-lg">Придумайте новый пароль</p>
			</div>
			<Form method="POST">
				<input type="hidden" name="email" autoComplete="email" value={loaderData.email} />
				<Input
					type="password"
					name="password"
					autoComplete="new-password"
					className="sm:w-80 lg:w-96"
					placeholder="Новый пароль"
					defaultValue={actionData?.fields?.password}
					minLength={4}
					required
				/>
				<Input
					type="password"
					name="password-repeat"
					autoComplete="new-password"
					className="mt-2 sm:w-80 lg:w-96"
					placeholder="Повторите пароль"
					defaultValue={actionData?.fields?.passwordRepeat}
					minLength={4}
					required
				/>

				<div className="mt-12 text-center md:text-left">
					<Button type="submit" className="w-full md:w-48" size="lg" disabled={pending}>
						{pending ? <LoaderCircleIcon className="animate-spin" /> : "Изменить пароль"}
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
