import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { Form, Link, useActionData, useLoaderData } from "react-router";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

export const action = async ({ params, request }: ActionFunctionArgs) => {
	const form = await request.formData();

	const name = form.get("name");

	if (typeof name !== "string") {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: "Форма неверно отправлена.",
		});
	}

	const fields = {
		name,
	};

	const sameName = await db.tag.findFirst({
		where: { name, NOT: [{ id: params.tagId }] },
	});
	if (sameName) {
		return badRequest({
			fieldErrors: null,
			fields,
			formError: "Тег уже существует",
		});
	}

	await db.tag.update({
		where: { id: params.tagId },
		data: {
			...fields,
		},
	});

	return redirect(`/admin/tags/${params.tagId}`);
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const tag = await db.tag.findUnique({ where: { id: params.tagId } });
	if (!tag) {
		throw new Response("Тег не найден", { status: 404 });
	}
	return { tag };
};

export default function TagEditRoute() {
	const actionData = useActionData<typeof action>();
	const data = useLoaderData<typeof loader>();

	return (
		<div>
			<h2 className="mb-2 font-medium">Редактирование тега</h2>
			<Form method="post" className="mt-2">
				<label>
					<p>Название</p>
					<input
						type="text"
						name="name"
						className="border"
						defaultValue={actionData?.fields?.name || data.tag.name}
						required
					/>
				</label>
				<div>
					<button type="submit" className="mt-8 block bg-blue-600 px-4 py-2 text-white">
						Сохранить изменения
					</button>
					<Link to={`../${data.tag.id}`} className="mt-1 inline-block border px-4 py-2">
						Вернуться
					</Link>
				</div>
				<div>{actionData?.formError ? <p>{actionData.formError}</p> : null}</div>
			</Form>
		</div>
	);
}
