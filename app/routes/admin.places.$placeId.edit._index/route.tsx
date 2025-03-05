import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import {
	Form,
	Link,
	redirect,
	useActionData,
	useLoaderData,
} from "react-router";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getPlacesStorageKey, placesFileStorage } from "~/utils/storage.server";

export const action = async ({ params, request }: ActionFunctionArgs) => {
	let imageName = "";

	const uploadHandler = async (fileUpload: FileUpload) => {
		if (fileUpload.type.startsWith("image/")) {
			const storageKey = getPlacesStorageKey(
				params.placeId as string,
				fileUpload.name,
			);
			await placesFileStorage.set(storageKey, fileUpload);
			imageName = storageKey;
			return placesFileStorage.get(storageKey);
		}
	};

	const form = await parseFormData(request, uploadHandler);

	const name = form.get("name");
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
		typeof tags !== "string"
	) {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: "Форма неверно отправлена.",
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
	};

	const sameName = await db.place.findFirst({
		where: { name, NOT: [{ id: params.placeId }] },
	});
	if (sameName) {
		return badRequest({
			fieldErrors: null,
			fields: { ...fields, tags },
			formError: `Место с названием ${name} уже существует`,
		});
	}

	if (creatorId !== "none") {
		const creator = await db.user.findUnique({ where: { id: creatorId } });
		if (!creator) {
			return badRequest({
				fieldErrors: null,
				fields: { ...fields, tags },
				formError: `Пользователя с Id ${creatorId} не существует`,
			});
		}
	}

	const splittedTags = tags.split(",").map((t) => ({
		where: {
			name: t.trim(),
		},
		create: {
			name: t.trim(),
		},
	}));
	await db.place.update({
		where: { id: params.placeId },
		data: {
			...fields,
			...(imageName !== "" && { image: imageName }),
			creatorId: creatorId !== "none" ? creatorId : null,
			tags: {
				set: [],
				...(tags.trim() !== "" && { connectOrCreate: splittedTags }),
			},
		},
	});

	throw redirect(`/admin/places/${params.placeId}`);
};

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	const place = await db.place.findUnique({
		where: { id: params.placeId },
		include: { tags: true },
	});
	if (!place) {
		throw new Response("Место не найдено", { status: 404 });
	}
	const placeowners = await db.user.findMany({ where: { role: "placeowner" } });
	const tags = place.tags.map((tag) => tag.name).join(", ");
	return { place, placeowners, tags };
};

export default function PlaceEditRoute() {
	const actionData = useActionData<typeof action>();
	const data = useLoaderData<typeof loader>();

	return (
		<div>
			<h2 className="mb-2 font-medium">Редактирование места</h2>
			<Form method="post" encType="multipart/form-data" className="mt-2">
				<label>
					<p>Название</p>
					<input
						type="text"
						name="name"
						className="border"
						defaultValue={actionData?.fields?.name || data.place.name}
						required
					/>
				</label>
				<label>
					<p>Владелец</p>
					<select
						name="creatorId"
						className="border"
						defaultValue={
							actionData?.fields?.creatorId || data.place.creatorId || "none"
						}
						required
					>
						<option value="none" selected>
							-- Отсутсвует --
						</option>
						{data.placeowners.map((po) => (
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
						defaultValue={actionData?.fields?.short || data.place.short || ""}
					/>
				</label>
				<label>
					<p>Детальное описание</p>
					<textarea
						name="description"
						className="border"
						defaultValue={
							actionData?.fields?.description || data.place.description || ""
						}
					/>
				</label>

				<hr className="my-4" />

				<label>
					<p>Город</p>
					<input
						type="text"
						name="city"
						className="border"
						defaultValue={actionData?.fields?.city || data.place.city || ""}
					/>
				</label>
				<label>
					<p>Адрес</p>
					<input
						type="text"
						name="address"
						className="border"
						defaultValue={
							actionData?.fields?.address || data.place.address || ""
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
							actionData?.fields?.coordinates || data.place.coordinates || ""
						}
					/>
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
					<p>Изображение</p>
					<img
						src={`/images/places/${data.place.image}`}
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
						to={`../${data.place.id}`}
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
