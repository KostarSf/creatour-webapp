import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { Form, Link, useLoaderData } from "react-router";
import { db } from "~/utils/db.server";

export const action = async ({ params, request }: ActionFunctionArgs) => {
	const form = await request.formData();
	if (form.get("intent") !== "delete") {
		throw new Response(`Действие ${form.get("intent")} не поддерживается`, {
			status: 400,
		});
	}
	const tag = await db.tag.findUnique({
		where: { id: params.tagId },
	});
	if (!tag) {
		throw new Response("Нельзя удалить несуществующий тег", {
			status: 404,
		});
	}
	await db.tag.delete({ where: { id: params.tagId } });
	return redirect("/admin/tags");
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const tag = await db.tag.findUnique({
		where: { id: params.tagId },
	});
	if (!tag) {
		throw new Response("Тег не найден", { status: 404 });
	}
	const places = await db.place.findMany({
		where: { tags: { some: { id: tag.id } } },
		select: { id: true, name: true },
	});
	const products = await db.product.findMany({
		where: { tags: { some: { id: tag.id } } },
		select: { id: true, name: true },
	});
	return { tag, places, products };
};

export default function TagRoute() {
	const data = useLoaderData<typeof loader>();

	return (
		<div className="flex gap-4">
			<div>
				<div className="mb-2 flex gap-2">
					<h2 className="font-medium">Тег - </h2>
					<Link to={"edit"} className="text-blue-600 hover:underline">
						Редактировать
					</Link>
					<Form
						method="post"
						onSubmit={(e) => {
							if (!confirm("Удалить тег?")) {
								e.preventDefault();
							}
						}}
					>
						<button
							type="submit"
							name="intent"
							value="delete"
							className="text-red-600 hover:underline"
						>
							Удалить
						</button>
					</Form>
				</div>
				<div className="flex flex-col gap-2">
					<p>
						Название: <br /> <b>{data.tag.name}</b>
					</p>
					<hr />
					{data.places.length > 0 ? (
						<>
							<div>
								<p>Места:</p>
								{data.places.map((place) => (
									<Link
										to={`/admin/places/${place.id}`}
										prefetch="intent"
										key={place.id}
										className="mr-2 text-blue-600 hover:underline"
									>
										{place.name}
									</Link>
								))}
							</div>
						</>
					) : null}
					{data.products.length > 0 ? (
						<>
							<div>
								<p>Турпродукты:</p>
								{data.products.map((product) => (
									<Link
										to={`/admin/products/${product.id}`}
										prefetch="intent"
										key={product.id}
										className="mr-2 text-blue-600 hover:underline"
									>
										{product.name}
									</Link>
								))}
							</div>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}
