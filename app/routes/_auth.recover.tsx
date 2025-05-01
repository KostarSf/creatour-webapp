//kostarsf3335@gmail.com

import { LoaderCircleIcon } from "lucide-react";
import { Form, useNavigation } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { sendRecoverLink } from "~/utils/session.server";
import type { Route } from "./+types/_auth.recover";

export const action = async ({ request }: Route.ActionArgs) => {
	const formData = await request.formData();
	const email = formData.get("email");

	if (typeof email !== "string") {
		return badRequest({
			success: false,
			fields: null,
			formError: "Форма неверно отправлена.",
		});
	}

	const fields = {
		email,
	};

	const user = await db.user.findUnique({ where: { email: email.trim().toLowerCase() } });
	if (!user) {
		return badRequest({
			success: false,
			fields,
			formError: "Такой почты не зарегистрировано.",
		});
	}

	if (!user.activatedAt && user.activateCode) {
		return badRequest({
			success: false,
			fields,
			formError: "Аккаунт не подтвержден, сброс пароля невозможен.",
		});
	}

	const code = crypto.randomUUID();
	await db.user.update({ where: { id: user.id }, data: { recoverCode: code } });

	await sendRecoverLink(user.id, code, user.email);

	return { success: true, fields: undefined, formError: undefined };
};

export default function RecoverPage({ actionData }: Route.ComponentProps) {
	const navigation = useNavigation();
	const pending = !!navigation.formData;

	return (
		<>
			<div className="my-12 text-center md:my-16 md:text-left">
				<p className="font-medium text-3xl/relaxed tracking-widest md:text-4xl/relaxed">
					Забыли пароль?
				</p>
				<p className="text-gray-800 leading-relaxed md:text-lg">Восстановление аккаунта</p>
			</div>
			{actionData?.success ? (
				<p>Письмо сброса пароля выслано на указанную почту.</p>
			) : (
				<Form method="POST">
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

					<div className="mt-12 text-center md:text-left">
						<Button type="submit" className="w-full md:w-48" size="lg" disabled={pending}>
							{pending ? <LoaderCircleIcon className="animate-spin" /> : "Сбросить пароль"}
						</Button>
						{actionData?.formError ? (
							<p className="mt-2 font-semibold text-red-700 text-sm" role="alert">
								{actionData.formError}
							</p>
						) : null}
					</div>
				</Form>
			)}
		</>
	);
}
