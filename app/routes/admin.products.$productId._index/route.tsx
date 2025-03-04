import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const action = async ({ params, request }: ActionArgs) => {
	const form = await request.formData();
	const intent = form.get("intent");

	const product = await db.product.findUnique({
		where: { id: params.productId },
	});
	if (!product) {
		throw new Response("Данный турпродукт не существует", {
			status: 404,
		});
	}

	if (intent === "delete") {
		await db.product.delete({ where: { id: params.productId } });
		return redirect("/admin/products");
	}

	if (intent === "addplace") {
		const placeId = form.get("place");
		if (typeof placeId !== "string") {
			throw new Response("Ошибка отправки формы", {
				status: 400,
			});
		}
		const place = await db.place.findUnique({
			where: { id: placeId },
		});
		if (!place) {
			throw new Response(`Места с Id ${placeId} не существует`, {
				status: 404,
			});
		}
		const routePoints = await db.routePoint.findMany({
			where: { productId: params.productId },
		});
		await db.product.update({
			where: { id: params.productId },
			data: {
				route: {
					create: {
						order: routePoints.length + 1,
						date: new Date().toISOString(),
						placeId,
					},
				},
			},
		});
		return new Response("", { status: 200 });
	} else if (intent === "removeplace") {
		const pointId = form.get("point");
		if (typeof pointId !== "string") {
			throw new Response("Ошибка отправки формы", {
				status: 400,
			});
		}
		const point = await db.routePoint.findUnique({
			where: { id: pointId },
		});
		if (!point) {
			throw new Response(`Точки маршрута с Id ${pointId} не существует`, {
				status: 404,
			});
		}
		await db.routePoint.delete({ where: { id: pointId } });
		return new Response("Ok", { status: 200 });
	} else if (intent === "updateplace") {
		const pointId = form.get("point");
		const order = form.get("order");
		const date = form.get("date");
		if (
			typeof pointId !== "string" ||
			typeof order !== "string" ||
			typeof date !== "string"
		) {
			throw new Response("Ошибка отправки формы", {
				status: 400,
			});
		}
		const point = await db.routePoint.findUnique({
			where: { id: pointId },
		});
		if (!point) {
			throw new Response(`Точки маршрута с Id ${pointId} не существует`, {
				status: 404,
			});
		}
		await db.routePoint.update({
			where: { id: pointId },
			data: {
				order: Number(order),
				date: !isNaN(new Date(date).getTime())
					? new Date(date).toISOString()
					: undefined,
			},
		});
		return new Response("Ok", { status: 200 });
	} else {
		throw new Response(`Действие ${form.get("intent")} не поддерживается`, {
			status: 400,
		});
	}
};

export const loader = async ({ params, request }: LoaderArgs) => {
	const product = await db.product.findUnique({
		where: { id: params.productId },
		include: {
			tags: true,
			media: true,
			rating: { include: { user: { select: { id: true, username: true } } } },

			comments: {
				include: {
					user: { select: { id: true, username: true } },
					media: { select: { id: true, url: true, type: true } },
				},
			},
			route: {
				include: { place: { select: { name: true } } },
				orderBy: { order: "asc" },
			},
		},
	});
	if (!product) {
		throw new Response("Турпродукт не найден", { status: 404 });
	}
	const creator = await db.user.findUnique({
		where: { id: product.creatorId },
	});
	const places = await db.place.findMany({
		select: { id: true, name: true },
	});
	const users = await db.user.findMany({
		select: { id: true, username: true },
	});
	return json({
		product,
		creator: creator ? { username: creator.username, id: creator.id } : null,
		places,
		users,
	});
};

function getLocalDate(date: Date) {
	let localDate = new Date(date);
	localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
	return localDate.toISOString().slice(0, 16);
}

export default function ProductRoute() {
	const data = useLoaderData<typeof loader>();

	const ratingsCount = data.product.rating.length;
	const ratingsSum = data.product.rating
		.map((r) => r.value)
		.reduce((prev, cur) => prev + cur, 0);
	const totalRatimg = Math.round((ratingsSum / ratingsCount) * 100) / 100;

	return (
		<div className="flex gap-4">
			<div>
				<div className="mb-2 flex gap-2">
					<h2 className="font-medium">Турпродукт - </h2>
					<Link to={"edit"} className="text-blue-600 hover:underline">
						Редактировать
					</Link>
					<Form
						method="post"
						onSubmit={(e) => {
							if (!confirm("Удалить турпродукт?")) {
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
						Название: <br /> <b>{data.product.name}</b>
					</p>
					{data.creator ? (
						<p>
							Создатель: <br />{" "}
							<Link
								to={`/admin/users/${data.creator.id}`}
								prefetch="intent"
								className="text-blue-600 hover:underline"
							>
								{data.creator.username}
							</Link>
						</p>
					) : null}
					<p>
						Краткое описание: <br /> <b>{data.product.short}</b>
					</p>
					<p>
						Детальное описание: <br /> <b>{data.product.description}</b>
					</p>

					<hr />

					<p>
						Тип турпродукта: <br /> <b>{data.product.type}</b>
					</p>
					<p>
						Цена: <br />{" "}
						<b>
							{data.product.price > 0 ? `${data.product.price} ₽` : "бесплатно"}
						</b>
					</p>
					<p>
						Турпродукт активен: <br />{" "}
						<b>{data.product.active ? "Да" : "Нет"}</b>
					</p>
					<p>
						Теги: <br />
						{data.product.tags.map((tag) => (
							<Link
								to={`/admin/tags/${tag.id}`}
								prefetch="intent"
								key={tag.id}
								className="pr-2 text-blue-600 hover:underline"
							>{`#${tag.name}`}</Link>
						))}
					</p>

					<hr />

					<p>
						Город: <br /> <b>{data.product.city}</b>
					</p>
					<p>
						Адрес: <br /> <b>{data.product.address}</b>
					</p>
					<p>
						Координаты: <br /> <b>{data.product.coordinates}</b>
					</p>
					<p>
						Дата проведения: <br />{" "}
						<b>
							{data.product.beginDate
								? new Date(data.product.beginDate).toLocaleString()
								: null}
						</b>
					</p>
					<p>
						Дата окончания: <br />{" "}
						<b>
							{data.product.endDate
								? new Date(data.product.endDate).toLocaleString()
								: null}
						</b>
					</p>
					<p>
						Ассистент: <br /> <b>{data.product.assistant}</b>
					</p>

					<hr />

					<p>Изображение:</p>
					{data.product.image ? (
						<img
							src={`/images/products/${data.product.image}`}
							alt="Изображение"
							className="w-64"
						/>
					) : null}
				</div>
			</div>
			<div>
				<h2 className="mb-2 font-medium">Программа мероприятия</h2>
				{data.product.route.length === 0 ? (
					<p>Не задана</p>
				) : (
					<div>
						{data.product.route.map((point) => (
							<p key={point.placeId} className="flex items-baseline gap-2">
								<Form
									method="post"
									className="flex flex-wrap items-baseline gap-2"
								>
									<input
										type="number"
										name="order"
										defaultValue={point.order}
										className="w-10 border"
									/>
									<Link
										to={`/admin/places/${point.placeId}`}
										className="text-blue-600 hover:underline"
									>
										<p>{point.place.name}</p>
									</Link>
									<input
										type="datetime-local"
										name="date"
										defaultValue={
											point.date
												? getLocalDate(new Date(point.date))
												: undefined
										}
										className="border"
									/>
									<input type="hidden" name="point" value={point.id} />
									<button
										type="submit"
										name="intent"
										value="updateplace"
										className="text-blue-600 hover:underline"
									>
										Обновить
									</button>
								</Form>
								<Form
									method="post"
									className="flex gap-2"
									onSubmit={(e) => {
										if (!confirm("Удалить точку маршрута?")) {
											e.preventDefault();
										}
									}}
								>
									<input type="hidden" name="point" value={point.id} />
									<button
										type="submit"
										name="intent"
										value="removeplace"
										className="text-red-600 hover:underline"
									>
										Удалить
									</button>
								</Form>
							</p>
						))}
					</div>
				)}
				<hr className="my-2" />
				<Form method="post">
					<select name="place" className="border">
						{data.places.map((place) => (
							<option key={place.id} value={place.id}>
								{place.name}
							</option>
						))}
					</select>
					<button
						type="submit"
						name="intent"
						value="addplace"
						className="px-2 text-blue-600 hover:underline"
					>
						Добавить
					</button>
				</Form>
				<h2 className="mb-2 mt-8 font-medium">Комментарии</h2>
				<div className="flex flex-col gap-2">
					{data.product.comments.length > 0 ? (
						data.product.comments.map((comment) => (
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
											value={`/admin/products/${data.product.id}`}
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
						value={`/admin/products/${data.product.id}`}
					/>
					<input type="hidden" name="parentType" value="product" />
					<input type="hidden" name="parentId" value={data.product.id} />
					<select name="userId" className="border">
						{data.users.map((user) => (
							<option key={user.id} value={user.id}>
								{user.username}
							</option>
						))}
					</select>
					<textarea name="text" className="border"></textarea>
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
				{data.product.rating.length > 0 ? (
					<div>
						{data.product.rating.map((r) => (
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
										value={`/admin/products/${data.product.id}`}
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
						value={`/admin/products/${data.product.id}`}
					/>
					<input type="hidden" name="parentType" value="product" />
					<input type="hidden" name="parentId" value={data.product.id} />
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
					{data.product.media.length > 0 ? (
						data.product.media.map((media) => (
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
											value={`/admin/products/${data.product.id}`}
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
					<input type="hidden" name="parentType" value="product" required />
					<input
						type="hidden"
						name="parentId"
						value={data.product.id}
						required
					/>
					<input
						type="hidden"
						name="redirectTo"
						value={`/admin/products/${data.product.id}`}
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
