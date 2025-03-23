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
	const user = await db.user.findUnique({
		where: { id: params.userId },
	});
	if (!user) {
		throw new Response("Нельзя удалить несуществующего пользователя", {
			status: 404,
		});
	}
	await db.user.delete({ where: { id: params.userId } });
	return redirect("/admin/users");
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const user = await db.user.findUnique({
		where: { id: params.userId },
		include: {
			createdPlaces: { select: { id: true, name: true } },
			createdProducts: { select: { id: true, name: true } },
			comments: {
				include: {
					parentPlace: { select: { id: true, name: true } },
					parentProduct: { select: { id: true, name: true } },
					media: {
						select: {
							id: true,
							url: true,
							type: true,
						},
					},
				},
			},
			ratings: {
				include: {
					place: { select: { name: true } },
					product: { select: { name: true } },
				},
			},
		},
	});
	if (!user) {
		throw new Response("Пользователь не найден", { status: 404 });
	}
	return { user };
};

export default function UserRoute() {
	const data = useLoaderData<typeof loader>();

	return (
		<div className="flex gap-4">
			<div>
				<div className="mb-2 flex gap-2">
					<h2 className="font-medium">Пользователь - </h2>
					<Link to={"edit"} className="text-blue-600 hover:underline">
						Редактировать
					</Link>
					<Form
						method="post"
						onSubmit={(e) => {
							if (!confirm("Удалить пользователя?")) {
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
						Имя пользователя: <br /> <b>{data.user.username}</b>
					</p>
					<p>
						Электронная почта: <br /> <b>{data.user.email}</b>
					</p>
					<p>
						Тип учетной записи: <br /> <b>{data.user.role}</b>
					</p>
					<hr />
					<p>
						Город: <br /> <b>{data.user.city}</b>
					</p>
					<p>
						Телефон: <br /> <b>{data.user.phone}</b>
					</p>
					{data.user.role === "creator" || data.user.role === "placeowner" ? (
						<>
							<p>
								Юр. наименование: <br /> <b>{data.user.legalName}</b>
							</p>
							<p>
								ИНН: <br /> <b>{data.user.inn}</b>
							</p>

							<hr />

							{data.user.role === "placeowner" ? (
								<p>
									Владелец объектов: <br />
									{data.user.createdPlaces.map((place) => (
										<Link
											to={`/admin/places/${place.id}`}
											prefetch="intent"
											key={place.id}
											className="mr-2 text-blue-600 hover:underline"
										>
											{place.name}
										</Link>
									))}
								</p>
							) : null}
							{data.user.role === "creator" ? (
								<p>
									Разработчик турпродуктов: <br />
									{data.user.createdProducts.map((product) => (
										<Link
											to={`/admin/products/${product.id}`}
											prefetch="intent"
											key={product.id}
											className="mr-2 text-blue-600 hover:underline"
										>
											{product.name}
										</Link>
									))}
								</p>
							) : null}
						</>
					) : null}
				</div>
			</div>
			<div>
				<h2 className="mb-2 font-medium">Комментарии</h2>
				<div className="flex flex-col gap-2">
					{data.user.comments.length > 0 ? (
						data.user.comments.map((comment) => {
							const isPlace = comment.parentPlace !== null;

							const name =
								(isPlace ? comment.parentPlace?.name : comment.parentProduct?.name) ||
								"Ошибка";
							const url = `/admin/${isPlace ? "places" : "products"}/${
								isPlace ? comment.placeId : comment.productId
							}`;

							return (
								<div key={comment.id}>
									<p className="flex items-baseline gap-2">
										<Link to={url} className="text-blue-600 hover:underline">
											{name}
										</Link>
										<Form
											method="post"
											action="/api/del-comment"
											onSubmit={(e) => {
												if (!confirm("Удалить комментарий?")) {
													e.preventDefault();
												}
											}}
										>
											<input
												type="hidden"
												name="redirectTo"
												value={`/admin/users/${data.user.id}`}
											/>
											<input type="hidden" name="id" value={comment.id} />
											<button type="submit" className="text-red-600 hover:underline">
												Удалить
											</button>
										</Form>
									</p>
									<p>{comment.text}</p>
									<div className="flex flex-wrap gap-1">
										{comment.media.map((media) => (
											<div key={media.id}>
												{media.type === "image" ? (
													<img src={media.url} alt={"media"} className="w-24" />
												) : (
													// biome-ignore lint/a11y/useMediaCaption: <explanation>
													<video src={media.url} className="w-24" loop />
												)}
											</div>
										))}
									</div>
								</div>
							);
						})
					) : (
						<p>Комментариев пока нет</p>
					)}
				</div>
				<h2 className="mt-8 mb-2 font-medium">Оценки:</h2>
				{data.user.ratings.length > 0 ? (
					data.user.ratings.map((rating) => {
						const isPlace = rating.place !== null;

						const name = (isPlace ? rating.place?.name : rating.product?.name) || "Ошибка";
						const url = `/admin/${isPlace ? "places" : "products"}/${
							isPlace ? rating.placeId : rating.productId
						}`;

						return (
							<div key={rating.id}>
								<p className="flex items-baseline gap-2">
									<Link to={url} className="text-blue-600 hover:underline">
										{name}
									</Link>
									<p>{rating.value}</p>
									<Form
										method="post"
										action="/api/del-rating"
										onSubmit={(e) => {
											if (!confirm("Удалить оценку?")) {
												e.preventDefault();
											}
										}}
									>
										<input
											type="hidden"
											name="redirectTo"
											value={`/admin/users/${data.user.id}`}
										/>
										<input type="hidden" name="id" value={rating.id} />
										<button type="submit" className="text-red-600 hover:underline">
											Удалить
										</button>
									</Form>
								</p>
							</div>
						);
					})
				) : (
					<p>Оценок пока нет</p>
				)}
			</div>
		</div>
	);
}
