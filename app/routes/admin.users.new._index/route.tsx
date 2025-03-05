import bcrypt from "bcryptjs";
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { useActionData } from "react-router";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	const form = await request.formData();

	const username = form.get("username");
	const email = form.get("email");
	const password = form.get("password");
	const role = form.get("role");

	if (
		typeof username !== "string" ||
		typeof email !== "string" ||
		typeof password !== "string" ||
		typeof role !== "string"
	) {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: "Форма неверно отправлена.",
		});
	}

	const fields = { username, email, password, role };

	const sameUsername = await db.user.findFirst({
		where: { username },
	});
	const sameEmail = await db.user.findFirst({
		where: { email },
	});
	if (sameUsername || sameEmail) {
		return badRequest({
			fieldErrors: null,
			fields,
			formError: sameUsername
				? `Имя пользователя ${username} занято. `
				: `${sameEmail}`
					? `Электронная почта ${email} занята. `
					: "",
		});
	}
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await db.user.create({
		data: { username, email, passwordHash, role },
	});
	if (user) {
		return redirect(`/admin/users/${user.id}`);
	}
	return badRequest({
		fieldErrors: null,
		fields,
		formError: "Что-то пошло не так",
	});
};

export default function NewUser() {
	const actionData = useActionData<typeof action>();

	return (
		<div>
			<h2 className="font-medium">Новый пользователь</h2>
			<form method="post" className="mt-2">
				<label>
					<p>Имя пользователя</p>
					<input
						type="text"
						name="username"
						className="border"
						defaultValue={actionData?.fields?.username}
						required
					/>
				</label>
				<label>
					<p>E-mail</p>
					<input
						type="email"
						name="email"
						className="border"
						defaultValue={actionData?.fields?.email}
						required
					/>
				</label>
				<label>
					<p>Пароль</p>
					<input
						type="password"
						name="password"
						className="border"
						defaultValue={actionData?.fields?.password}
						required
					/>
				</label>
				<label>
					<p>Тип аккаунта</p>
					<select
						name="role"
						className="border"
						defaultValue={actionData?.fields?.role}
					>
						<option value="user">Пользователь</option>
						<option value="creator">Разработчик турпродукта</option>
						<option value="placeowner">Владелец объекта</option>
						<option value="admin">Администратор</option>
					</select>
				</label>
				<button
					type="submit"
					className="mt-8 block bg-blue-600 px-4 py-2 text-white"
				>
					Создать
				</button>
				<div>
					{actionData?.formError ? <p>{actionData.formError}</p> : null}
				</div>
			</form>
		</div>
	);
}
