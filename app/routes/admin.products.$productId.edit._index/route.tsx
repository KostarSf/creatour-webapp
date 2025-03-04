import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
	unstable_composeUploadHandlers,
	unstable_createFileUploadHandler,
	unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import { unstable_parseMultipartFormData } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

export const action = async ({ params, request }: ActionFunctionArgs) => {
	let imageName = "";

	const uploadHandler = unstable_composeUploadHandlers(
		unstable_createFileUploadHandler({
			directory: "public/images/products",
			avoidFileConflicts: false,
			file: ({ filename }) => {
				const productId = params.productId || "file";
				imageName = `${productId}.${filename.split(".").pop()}` || filename;
				return imageName;
			},
		}),
		unstable_createMemoryUploadHandler(),
	);
	const form = await unstable_parseMultipartFormData(request, uploadHandler);

	const name = form.get("name");
	const type = form.get("type");
	const price = form.get("price");
	const active = form.get("active");
	const beginDate = form.get("beginDate");
	const endDate = form.get("endDate");
	const assistant = form.get("assistant");
	const creatorId = form.get("creatorId");
	const short = form.get("short");
	const description = form.get("description");
	const city = form.get("city");
	const address = form.get("address");
	const coordinates = form.get("coordinates");
	const tags = form.get("tags");

	if (
		typeof name !== "string" ||
		typeof creatorId !== "string" ||
		typeof short !== "string" ||
		typeof description !== "string" ||
		typeof city !== "string" ||
		typeof address !== "string" ||
		typeof coordinates !== "string" ||
		typeof tags !== "string" ||
		typeof type !== "string" ||
		typeof price !== "string" ||
		typeof beginDate !== "string" ||
		typeof endDate !== "string" ||
		typeof assistant !== "string"
	) {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: `Форма неверно отправлена.`,
		});
	}

	const fields = {
		name,
		creatorId,
		short,
		description,
		city,
		address,
		coordinates,
		type,
		price,
		active: Boolean(active),
		beginDate,
		endDate,
		assistant,
	};

	if (isNaN(Number(price))) {
		return badRequest({
			fieldErrors: null,
			fields: { ...fields, tags },
			formError: `Неверная цена`,
		});
	}

	const sameName = await db.product.findFirst({
		where: { name, NOT: [{ id: params.productId }] },
	});
	if (sameName) {
		return badRequest({
			fieldErrors: null,
			fields: { ...fields, tags },
			formError: `Турпродукт с названием ${name} уже существует`,
		});
	}

	const creator = await db.user.findUnique({ where: { id: creatorId } });
	if (!creator) {
		return badRequest({
			fieldErrors: null,
			fields: { ...fields, tags },
			formError: `Пользователя с Id ${creatorId} не существует`,
		});
	} else {
		const splittedTags = tags.split(",").map((t) => ({
			where: {
				name: t.trim(),
			},
			create: {
				name: t.trim(),
			},
		}));
		await db.product.update({
			where: { id: params.productId },
			data: {
				...fields,
				price: Number(price) || 0,
				beginDate: !isNaN(new Date(beginDate).getTime())
					? new Date(beginDate).toISOString()
					: null,
				endDate: !isNaN(new Date(endDate).getTime())
					? new Date(endDate).toISOString()
					: null,
				...(imageName !== "" && { image: imageName }),
				tags: {
					set: [],
					...(tags.trim() !== "" && { connectOrCreate: splittedTags }),
				},
			},
		});
	}

	return redirect(`/admin/products/${params.productId}`);
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const product = await db.product.findUnique({
		where: { id: params.productId },
		include: { tags: true },
	});
	if (!product) {
		throw new Response("Турпродукт не найден", { status: 404 });
	}
	const creators = await db.user.findMany({ where: { role: "creator" } });
	const tags = product.tags.map((tag) => tag.name).join(", ");
	return json({
		product: {
			...product,
			beginDate: getLocalDate(product.beginDate),
			endDate: getLocalDate(product.endDate),
		},
		creators,
		tags,
	});
};

function getLocalDate(date: Date | null) {
	if (date === null) return null;
	const localDate = new Date(date);
	localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
	return localDate.toISOString().slice(0, 16);
}

export default function ProductEditRoute() {
	const actionData = useActionData<typeof action>();
	const data = useLoaderData<typeof loader>();
	return (
		<div>
			<h2 className="mb-2 font-medium">Редактирование турпродукта</h2>
			<Form method="post" encType="multipart/form-data" className="mt-2">
				<label>
					<p>Название</p>
					<input
						type="text"
						name="name"
						className="border"
						defaultValue={actionData?.fields?.name || data.product.name}
						required
					/>
				</label>
				<label>
					<p>Создатель</p>
					<select
						name="creatorId"
						className="border"
						defaultValue={
							actionData?.fields?.creatorId || data.product.creatorId
						}
						required
					>
						{data.creators.map((po) => (
							<option value={po.id} key={po.id}>
								{po.username}
							</option>
						))}
					</select>
				</label>
				<label>
					<p>Краткое описание</p>
					<input
						type="text"
						name="short"
						className="border"
						defaultValue={actionData?.fields?.short || data.product.short || ""}
					/>
				</label>
				<label>
					<p>Детальное описание</p>
					<textarea
						name="description"
						className="border"
						defaultValue={
							actionData?.fields?.description || data.product.description || ""
						}
					></textarea>
				</label>

				<hr className="my-4" />

				<label>
					<p>Тип турпродукта</p>
					<select
						name="type"
						className="border"
						defaultValue={actionData?.fields?.type || data.product.type}
						required
					>
						<option value="excursion">Экскурсия</option>
						<option value="tour">Тур</option>
						<option value="quest">Мероприятие</option>
						<option value="event">Событие</option>
					</select>
				</label>
				<label>
					<p>Цена</p>
					<input
						type="string"
						name="price"
						className="border"
						defaultValue={
							actionData?.fields?.price || data.product.price || "0"
						}
					/>
				</label>
				<label>
					<p>
						<input
							type="checkbox"
							name="active"
							defaultChecked={actionData?.fields?.active || data.product.active}
						/>
						<span className="px-2">Турпродукт активен</span>
					</p>
				</label>
				<label>
					<p>Теги через запятую</p>
					<input
						type="text"
						name="tags"
						className="border"
						defaultValue={actionData?.fields?.tags || data.tags || ""}
					/>
				</label>

				<hr className="my-4" />

				<label>
					<p>Город</p>
					<input
						type="text"
						name="city"
						className="border"
						defaultValue={actionData?.fields?.city || data.product.city || ""}
					/>
				</label>
				<label>
					<p>Адрес</p>
					<input
						type="text"
						name="address"
						className="border"
						defaultValue={
							actionData?.fields?.address || data.product.address || ""
						}
					/>
				</label>
				<label>
					<p>Координаты</p>
					<input
						type="text"
						name="coordinates"
						className="border"
						defaultValue={
							actionData?.fields?.coordinates || data.product.coordinates || ""
						}
					/>
				</label>
				<label>
					<p>Дата проведения</p>
					<input
						type="datetime-local"
						name="beginDate"
						className="border"
						defaultValue={
							actionData?.fields?.beginDate || data.product.beginDate || ""
						}
					/>
				</label>
				<label>
					<p>Дата окончания</p>
					<input
						type="datetime-local"
						name="endDate"
						className="border"
						defaultValue={
							actionData?.fields?.endDate || data.product.endDate || ""
						}
					/>
				</label>
				<label>
					<p>Ассистент</p>
					<input
						type="text"
						name="assistant"
						className="border"
						defaultValue={
							actionData?.fields?.assistant || data.product.assistant || ""
						}
					/>
				</label>

				<hr className="my-4" />

				<label>
					<p>Изображение</p>
					<img
						src={`/images/products/${data.product.image}`}
						alt="Изображение"
						className="w-64"
					/>
					<input
						type="file"
						name="image"
						accept=".png,.jpg,.jpeg,.webp"
						className="border"
					/>
				</label>
				<div>
					<button
						type="submit"
						className="mt-8 block bg-blue-600 px-4 py-2 text-white"
					>
						Сохранить изменения
					</button>
					<Link
						to={`../${data.product.id}`}
						className="mt-1 inline-block border px-4 py-2"
					>
						Вернуться
					</Link>
				</div>
				<div>
					{actionData?.formError ? <p>{actionData.formError}</p> : null}
				</div>
			</Form>
		</div>
	);
}
