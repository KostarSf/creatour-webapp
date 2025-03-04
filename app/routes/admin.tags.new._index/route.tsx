import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	const form = await request.formData();

	const name = form.get("name");

	if (typeof name !== "string") {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: `Форма неверно отправлена.`,
		});
	}

	const fields = { name };

	const sameName = await db.tag.findFirst({
		where: { name },
	});

	if (sameName) {
		return badRequest({
			fieldErrors: null,
			fields,
			formError: `Такой тег уже существует. `,
		});
	}
	const tag = await db.tag.create({
		data: { name },
	});
	if (tag) {
		return redirect(`/admin/tags/${tag.id}`);
	} else {
		return badRequest({
			fieldErrors: null,
			fields,
			formError: `Что-то пошло не так`,
		});
	}
};

export default function NewTag() {
	const actionData = useActionData<typeof action>();

	return (
		<div>
			<h2 className="font-medium">Новый тег</h2>
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
