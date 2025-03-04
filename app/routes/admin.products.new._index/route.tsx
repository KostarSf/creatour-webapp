import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	const form = await request.formData();

	const name = form.get("name");
	const creatorId = form.get("creatorId");
	const type = form.get("type");

	if (
		typeof name !== "string" ||
		typeof creatorId !== "string" ||
		typeof type !== "string"
	) {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: "Форма неверно отправлена.",
		});
	}

	const fields = { name, creatorId, type };

	const sameName = await db.product.findFirst({
		where: { name },
	});
	if (sameName) {
		return badRequest({
			fieldErrors: null,
			fields,
			formError: `Турпродукт с названием ${name} уже существует`,
		});
	}

	const user = await db.user.findUnique({ where: { id: creatorId } });
	if (!user) {
		return badRequest({
			fieldErrors: null,
			fields,
			formError: `Пользователя с Id ${creatorId} не существует`,
		});
	}

	const product = await db.product.create({
		data: { ...fields },
	});
	if (product) {
		return redirect(`/admin/products/${product.id}`);
	}
	return badRequest({
		fieldErrors: null,
		fields,
		formError: "Что-то пошло не так",
	});
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const creators = await db.user.findMany({ where: { role: "creator" } });
	return json({ creators });
};

export default function NewProduct() {
	const actionData = useActionData<typeof action>();
	const data = useLoaderData<typeof loader>();

	if (data.creators.length === 0) {
		return (
			<p>
				Сначала добавьте пользователей с ролью <b>creator</b>
			</p>
		);
	}

	return (
		<div>
			<h2 className="font-medium">Новый турпродукт</h2>
			<form method="post" className="mt-2">
				<label>
					<p>Название</p>
					<input
						type="text"
						name="name"
						className="border"
						defaultValue={actionData?.fields?.name}
						required
					/>
				</label>
				<label>
					<p>Тип турпродукта</p>
					<select
						name="type"
						className="border"
						defaultValue={actionData?.fields?.type}
						required
					>
						<option value="excursion">Экскурсия</option>
						<option value="tour">Тур</option>
						<option value="quest">Мероприятие</option>
						<option value="event">Событие</option>
					</select>
				</label>
				<label>
					<p>Разработчик</p>
					<select
						name="creatorId"
						className="border"
						defaultValue={actionData?.fields?.creatorId}
						required
					>
						{data.creators.map((cr) => (
							<option value={cr.id} key={cr.id}>
								{cr.username}
							</option>
						))}
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
