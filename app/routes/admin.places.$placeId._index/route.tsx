import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const action = async ({ params, request }: ActionFunctionArgs) => {
	const form = await request.formData();
	if (form.get("intent") !== "delete") {
		throw new Response(`Действие ${form.get("intent")} не поддерживается`, {
			status: 400,
		});
	}
	const place = await db.place.findUnique({
		where: { id: params.placeId },
	});
	if (!place) {
		throw new Response("Нельзя удалить несуществующее место", {
			status: 404,
		});
	}
	await db.place.delete({ where: { id: params.placeId } });
	return redirect("/admin/places");
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const place = await db.place.findUnique({
		where: { id: params.placeId },
		include: {
			tags: true,
			rating: { include: { user: { select: { id: true, username: true } } } },
			comments: {
				include: {
					user: { select: { id: true, username: true } },
					media: { select: { id: true, url: true, type: true } },
				},
			},
			creator: { select: { id: true, username: true } },
			media: true,
		},
	});
	if (!place) {
		throw new Response("Место не найдено", { status: 404 });
	}
	const products = await db.product.findMany({
		where: { route: { some: { placeId: place.id } } },
		select: { id: true, name: true },
	});
	const users = await db.user.findMany({
		select: { id: true, username: true },
	});
	return json({
		place,
		products,
		users,
	});
};

export default function PlaceRoute() {
	const data = useLoaderData<typeof loader>();

	const ratingsCount = data.place.rating.length;
	const ratingsSum = data.place.rating
		.map((r) => r.value)
		.reduce((prev, cur) => prev + cur, 0);
	const totalRatimg = Math.round((ratingsSum / ratingsCount) * 100) / 100;

	return (
		<div className="flex gap-4">
			<div>
				<div className="mb-2 flex gap-2">
					<h2 className="font-medium">Место - </h2>
					<Link to={"edit"} className="text-blue-600 hover:underline">
						Редактировать
					</Link>
					<Form
						method="post"
						onSubmit={(e) => {
							if (!confirm("Удалить место?")) {
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
						Название: <br /> <b>{data.place.name}</b>
					</p>
					{data.place.creator ? (
						<p>
							Владелец: <br />{" "}
							<Link
								to={`/admin/users/${data.place.creator.id}`}
								prefetch="intent"
								className="text-blue-600 hover:underline"
							>
								{data.place.creator.username}
							</Link>
						</p>
					) : null}
					{data.products.length > 0 ? (
						<p>
							Используется в турпродуктах: <br />
							{data.products.map((product) => (
								<Link
									to={`/admin/products/${product.id}`}
									key={product.id}
									className="mr-2 text-blue-600 hover:underline"
								>
									{product.name}
								</Link>
							))}
						</p>
					) : null}
					<p>
						Краткое описание: <br /> <b>{data.place.short}</b>
					</p>
					<p>
						Детальное описание: <br /> <b>{data.place.description}</b>
					</p>
					{/* картинка */}
					<hr />
					<p>
						Город: <br /> <b>{data.place.city}</b>
					</p>
					<p>
						Адрес: <br /> <b>{data.place.address}</b>
					</p>
					<p>
						Координаты: <br /> <b>{data.place.coordinates}</b>
					</p>
					<p>
						Теги: <br />
						{data.place.tags.map((tag) => (
							<Link
								to={`/admin/tags/${tag.id}`}
								prefetch="intent"
								key={tag.id}
								className="pr-2 text-blue-600 hover:underline"
							>{`#${tag.name}`}</Link>
						))}
					</p>
					<hr />
					<p>Изображение:</p>
					{data.place.image ? (
						<img
							src={`/images/places/${data.place.image}`}
							alt="Изображение"
							className="w-64"
						/>
					) : null}
				</div>
			</div>
			<div>
				<h2 className="mb-2 font-medium">Комментарии</h2>
				<div className="flex flex-col gap-2">
					{data.place.comments.length > 0 ? (
						data.place.comments.map((comment) => (
							<div key={comment.id}>
								<p className="flex items-baseline gap-2">
									<Link
										to={`/admin/users/${comment.userId}`}
										className="text-blue-600 hover:underline"
									>
										{comment.user.username}
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
											value={`/admin/places/${data.place.id}`}
										/>
										<input type="hidden" name="id" value={comment.id} />
										<button
											type="submit"
											className="text-red-600 hover:underline"
										>
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
												<video src={media.url} className="w-24" loop />
											)}
										</div>
									))}
								</div>
							</div>
						))
					) : (
						<p>Комментариев пока нет</p>
					)}
				</div>
				<hr className="my-4" />
				<Form
					method="post"
					action="/api/add-comment"
					encType="multipart/form-data"
					className="flex flex-col gap-2"
				>
					<input
						type="hidden"
						name="redirectTo"
						value={`/admin/places/${data.place.id}`}
					/>
					<input type="hidden" name="parentType" value="place" />
					<input type="hidden" name="parentId" value={data.place.id} />
					<select name="userId" className="border" required>
						{data.users.map((user) => (
							<option key={user.id} value={user.id}>
								{user.username}
							</option>
						))}
					</select>
					<textarea name="text" className="border" required></textarea>
					<input
						type="file"
						name="media"
						multiple
						accept=".png,.jpg,.jpeg,.webp,.webm,.mp4"
						className="border"
					/>
					<button type="submit" className="bg-blue-600 text-white">
						Отправить
					</button>
				</Form>
				<h2 className="mb-2 mt-8 font-medium">
					Рейтинг: <b>{totalRatimg || null}</b>
				</h2>
				{data.place.rating.length > 0 ? (
					<div>
						{data.place.rating.map((r) => (
							<p key={r.id}>
								<Link
									to={`/admin/users/${r.userId}`}
									className="text-blue-600 hover:underline"
								>
									{r.user.username}
								</Link>
								<span className="px-2">{r.value}</span>
								<Form
									method="post"
									action="/api/del-rating"
									onSubmit={(e) => {
										if (!confirm("Удалить рейтинг?")) {
											e.preventDefault();
										}
									}}
									className="inline"
								>
									<input
										type="hidden"
										name="redirectTo"
										value={`/admin/places/${data.place.id}`}
									/>
									<input type="hidden" name="id" value={r.id} />
									<button
										type="submit"
										className="text-red-600 hover:underline"
									>
										Удалить
									</button>
								</Form>
							</p>
						))}
					</div>
				) : (
					<p>Оценок пока нет</p>
				)}
				<hr className="my-4" />
				<Form
					method="post"
					action="/api/add-rating"
					className="flex flex-col gap-2"
				>
					<input
						type="hidden"
						name="redirectTo"
						value={`/admin/places/${data.place.id}`}
					/>
					<input type="hidden" name="parentType" value="place" />
					<input type="hidden" name="parentId" value={data.place.id} />
					<select name="userId" className="border" required>
						{data.users.map((user) => (
							<option key={user.id} value={user.id}>
								{user.username}
							</option>
						))}
					</select>
					<div className="flex gap-1">
						<span>1</span>
						<input
							type="range"
							name="value"
							min="1"
							max="10"
							defaultValue="10"
							className="flex-1"
						/>
						<span>10</span>
					</div>
					<button type="submit" className="bg-blue-600 text-white">
						Оценить
					</button>
				</Form>
				<h2 className="mb-2 mt-8 font-medium">Медиа:</h2>
				<div className="flex flex-col gap-1">
					{data.place.media.length > 0 ? (
						data.place.media.map((media) => (
							<div key={media.id} className="flex gap-2">
								{media.type === "image" ? (
									<img
										src={media.url}
										alt={media.name || "media"}
										className="w-32"
									/>
								) : (
									<video src={media.url} className="w-32" loop />
								)}
								<div>
									<p>
										<b>{media.community ? "От коммьюнити" : media.name}</b>
									</p>
									<p>{media.description}</p>
									<Form
										method="delete"
										action="/api/media"
										onSubmit={(e) => {
											if (!confirm("Удалить медиафайл?")) {
												e.preventDefault();
											}
										}}
									>
										<input
											type="hidden"
											name="redirectTo"
											value={`/admin/places/${data.place.id}`}
										/>
										<input type="hidden" name="id" value={media.id} />
										<button
											type="submit"
											className="text-red-600 hover:underline"
										>
											Удалить
										</button>
									</Form>
								</div>
							</div>
						))
					) : (
						<p>Здесь пока пусто</p>
					)}
				</div>
				<hr className="my-4" />
				<Form
					method="post"
					action="/api/media"
					encType="multipart/form-data"
					className="flex flex-col gap-2"
				>
					<p>Добавить медиа:</p>
					<input type="hidden" name="parentType" value="place" required />
					<input type="hidden" name="parentId" value={data.place.id} required />
					<input
						type="hidden"
						name="redirectTo"
						value={`/admin/places/${data.place.id}`}
					/>
					<input
						type="file"
						name="media"
						accept=".png,.jpg,.jpeg,.webp,.webm,.mp4"
						className="border"
						required
					/>
					<input
						type="text"
						name="name"
						className="border"
						placeholder="Название (не обязательно)"
					/>
					<textarea
						name="description"
						className="border"
						placeholder="Описание (не обязательно)"
					></textarea>
					<button type="submit" className="bg-blue-600 text-white">
						Добавить
					</button>
				</Form>
			</div>
		</div>
	);
}
