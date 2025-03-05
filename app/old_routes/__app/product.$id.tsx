import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUser, requireUserId } from "~/utils/session.server";

function validateComment(comment: string) {
	if (comment.length < 4) {
		return "Комментарий слишком короткий";
	}
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const product = await db.product.findUnique({
		where: { id: params.id },
		include: {
			rating: true,
			route: {
				include: {
					place: {
						select: { id: true, image: true, name: true, address: true },
					},
				},
			},
			comments: { include: { user: { select: { id: true, username: true } } } },
		},
	});
	if (!product) {
		throw new Response("Product not found", { status: 404 });
	}

	const user = await getUser(request);
	const ratingsCount = product.rating.length;
	const ratingsSum = product.rating
		.map((r) => r.value)
		.reduce((prev, cur) => prev + cur, 0);
	const totalRatimg = Math.round((ratingsSum / ratingsCount) * 100) / 100;

	const subscribed =
		(await db.product.findFirst({
			where: { id: product.id, buyers: { some: { id: user?.id } } },
		})) !== null;

	return {
		product,
		rating: totalRatimg,
		user: user,
		subscribed,
		url: request.url,
	};
}

export async function action({ params, request }: ActionFunctionArgs) {
	const userId = await requireUserId(request);

	const form = await request.formData();
	const intent = form.get("intent");
	if (intent === "subscribe") {
		const product = await db.product.findUnique({ where: { id: params.id } });
		if (product) {
			const activeProduct = await db.product.findFirst({
				where: {
					id: product.id,
					buyers: { some: { id: userId } },
				},
			});
			if (activeProduct) {
				await db.user.update({
					where: { id: userId },
					data: {
						activeProducts: {
							disconnect: {
								id: product.id,
							},
						},
					},
				});
			} else {
				await db.user.update({
					where: { id: userId },
					data: {
						activeProducts: {
							connect: {
								id: product.id,
							},
						},
					},
				});
			}
		}

		return new Response("ok", { status: 200 });
	}
	if (intent === "rating") {
		const userId = form.get("userId");
		const value = form.get("value");

		if (
			typeof userId !== "string" ||
			typeof value !== "string" ||
			Number.isNaN(Number(value))
		) {
			return badRequest({
				fieldErrors: null,
				fields: null,
				formError: "Форма неверно отправлена.",
			});
		}

		const alreadyRated = await db.rating.findFirst({
			where: {
				userId,
				productId: params.id,
			},
		});

		if (alreadyRated) {
			await db.rating.update({
				where: { id: alreadyRated.id },
				data: {
					value: Number(value),
				},
			});
		} else {
			await db.rating.create({
				data: {
					userId,
					value: Number(value),
					productId: params.id,
				},
			});
		}
		return new Response("ok", { status: 200 });
	}

	const postId = form.get("postId");
	const text = form.get("text");
	if (typeof text !== "string" || typeof postId !== "string") {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: "Форма неверно отправлена.",
		});
	}

	const fieldErrors = {
		text: validateComment(text),
	};
	const fields = { text, postId };
	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields, formError: null });
	}

	await db.comment.create({
		data: {
			text: text,
			userId: userId,
			productId: postId,
		},
	});

	return {
		fields: {
			postId: postId,
			text: "",
		},
		fieldErrors: {
			text: null,
		},
	};
}

export default function TripPage() {
	const data = useLoaderData<typeof loader>();
	const product = data.product;
	const route = data.product.route;
	const comments = data.product.comments;
	const user = data.user;

	const actionData = useActionData<typeof action>();

	return (
		<div className="px-4 pt-6 pb-2">
			<img
				className="h-32 w-96 rounded object-cover"
				src={`/images/products/${product.image}`}
				alt={product.image || "image"}
			/>
			<h2 className="my-3 font-semibold text-2xl leading-none">
				{product.name}
			</h2>
			<p className="mb-2">{product.description}</p>
			<p className="font-semibold text-sm">
				{product.city}, {product.address}
			</p>
			<p>
				Дата проведения:{" "}
				{product.beginDate
					? new Date(product.beginDate).toLocaleString()
					: "не задана"}
			</p>
			<p>
				Длительность:{" "}
				{product.beginDate && product.endDate
					? new Date(
							new Date(product.endDate).valueOf() -
								new Date(product.beginDate).valueOf(),
						).toLocaleTimeString()
					: "не задана"}
			</p>
			<p className="font-semibold text-sm">Гид: {product.assistant}</p>
			<p className="font-semibold text-sm">Рейтинг: {data.rating}</p>
			<div className="my-3">
				<Form method="post">
					<button
						type="submit"
						name="intent"
						value="subscribe"
						className={
							"block rounded bg-blue-500 px-4 py-2 text-center font-semibold text-white transition hover:bg-blue-400 hover:shadow-blue-100 hover:shadow-md sm:inline-block"
						}
					>
						{data.subscribed
							? "Отменить посещение"
							: `Посетить${product.price !== 0 ? ` за ${product.price} ₽` : ""}`}
					</button>
				</Form>
			</div>

			<p className="mt-6 font-semibold text-lg">Маршрут:</p>
			<div className="flex flex-col gap-4">
				{route.map((r) => (
					<Link
						to={`/place/${r.placeId}`}
						key={r.id}
						className="flex gap-2 border-blue-500 border-l-4 pl-2"
					>
						<img
							src={`/images/places/${r.place.image}`}
							alt=""
							className="w-12"
						/>
						<div>
							<p className="font-semibold hover:text-blue-600">
								{r.place.name}
							</p>
							<p className="text-sm">{r.place.address}</p>
						</div>
					</Link>
				))}
			</div>

			{user ? (
				<>
					<Form method="post" className="mt-4">
						<p>Оцените турпродукт</p>
						<input type="hidden" name="userId" value={user.id} />
						<select name="value" className="border">
							<option value="10">10</option>
							<option value="9">9</option>
							<option value="8">8</option>
							<option value="7">7</option>
							<option value="6">6</option>
							<option value="5">5</option>
							<option value="4">4</option>
							<option value="3">3</option>
							<option value="2">2</option>
							<option value="1">1</option>
						</select>
						<button
							type="submit"
							name="intent"
							value="rating"
							className="mx-1 bg-blue-600 px-4 text-white"
						>
							Оценить
						</button>
					</Form>
					<p>
						Ваша оценка:{" "}
						{data.product.rating
							.filter((r) => r.userId === user.id)
							.map((r) => (
								<span className="font-semibold" key={r.id}>
									{r.value}
								</span>
							))}
					</p>
				</>
			) : null}

			<p className="mt-6 font-semibold text-lg">Комментарии:</p>
			<div>
				{comments.length === 0 ? (
					<p>Здесь пока пусто</p>
				) : (
					comments.map((c) => (
						<div key={c.id} className="mb-4">
							<p className="font-semibold text-lg">{c.user.username}</p>
							<p>{c.text}</p>
							<div className="flex items-baseline gap-4">
								<p className="text-slate-500 text-sm">
									{new Date(c.createdAt).toLocaleString()}
								</p>
								{user && c.userId === user.id ? (
									<Form action="/remove-comment" method="post">
										<input type="hidden" name="commentId" value={c.id} />
										<input type="hidden" name="redirect-to" value={data.url} />
										<button
											type="submit"
											className="text-blue-600 hover:underline"
										>
											Удалить комментарий
										</button>
									</Form>
								) : null}
							</div>
						</div>
					))
				)}
			</div>
			{user ? (
				<>
					<Form className="mt-8 flex items-start gap-4" method="post">
						<input type="hidden" name="postId" value={product.id} />
						<div>
							<textarea
								placeholder="Ваш комментарий"
								name="text"
								className="w-64 border px-1"
								defaultValue={actionData?.fields?.text}
							/>
							{actionData?.fieldErrors?.text ? (
								<p className="font-semibold text-red-600 text-sm">
									{actionData?.fieldErrors?.text}
								</p>
							) : null}
						</div>
						<button
							type="submit"
							className="block rounded bg-blue-600 px-4 py-1 font-semibold text-lg text-white"
						>
							Отправить
						</button>
					</Form>
				</>
			) : null}
		</div>
	);
}
