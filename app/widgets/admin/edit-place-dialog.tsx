import type { Media, Place, Tag, User } from "@prisma-app/client";

import clsx from "clsx";
import { ImageOffIcon } from "lucide-react";
import React from "react";
import { href } from "react-router";
import type { LiteUser } from "~/models/users";
import { EditDialog, type EditableField } from "./adit-dialog";
import { UsersSelect } from "./users-select";

export interface PlaceWithRelations extends Place {
	media: Media[];
	tags: Tag[];
}

interface PlaceDialogContextPayload {
	placeowners: LiteUser[];
	ownerRequired?: boolean;
}
const PlaceDialogContext = React.createContext<PlaceDialogContextPayload>({ placeowners: [] });

interface PlaceDialogContextProviderProps {
	children: (context: PlaceDialogContextPayload) => React.ReactNode;
}
const PlaceDialogContextProvider = ({ children }: PlaceDialogContextProviderProps) => {
	const context = React.use(PlaceDialogContext);
	return children(context);
};

const createPlaceFields: EditableField<PlaceWithRelations>[] = [
	{
		name: "creatorId",
		type: "custom",
		title: "Владелец",
		component: (place) => (
			<PlaceDialogContextProvider>
				{({ placeowners, ownerRequired }) => (
					<UsersSelect
						name="creatorId"
						defaultId={place?.creatorId ?? undefined}
						users={placeowners}
						required={ownerRequired}
					/>
				)}
			</PlaceDialogContextProvider>
		),
	},
	{ name: "name", title: "Наименование", required: true },
	{
		name: "tags",
		title: "Теги (через запятую)",
		transformValue: (product) => product?.tags.map((tag) => tag.name).join(", "),
	},
	{ name: "short", title: "Краткое описание" },
	{ name: "description", type: "textarea", title: "Описание" },
	{ name: "city", title: "Город" },
	{ name: "address", title: "Адрес" },
	{ name: "coordinates", title: "Координаты (широта, долгота)" },
];

const editableFields: EditableField<PlaceWithRelations>[] = [
	{ name: "id", type: "hidden", required: true },
	{
		name: "newImage",
		title: "Новое изображение",
		type: "file",
		accept: "image/avif,image/webp,image/jpeg,image/png",
	},
	...createPlaceFields,
];

function EditPlaceDialog({ place, children }: { place: PlaceWithRelations; children?: React.ReactNode }) {
	return (
		<EditDialog
			header={<EditPlaceDialogHeader place={place} />}
			action={href("/api/update-place")}
			title="Редактирование объекта"
			data={place}
			fields={editableFields}
			deleteCallback={(submit) => {
				const formData = new FormData();
				formData.set("placeId", place.id);

				submit(formData, { method: "POST", action: href("/api/delete-place") });
			}}
			deleteTitle={`Удалить объект ${place.name}?`}
			deleteDescription="Объект будет удален из системы. Это действие необратимо"
			searchParamsState={{ name: "edit", value: String(place.id) }}
		>
			{children}
		</EditDialog>
	);
}

function EditPlaceDialogHeader({ place }: { place: Place }) {
	return (
		<div className="grid gap-1.5">
			<p className="text-sm leading-none">Изображение объекта</p>
			<div
				className={clsx(
					"grid h-48 place-items-center overflow-hidden rounded-lg border",
					place.image ? "bg-white" : "bg-secondary",
				)}
			>
				{place.image ? (
					<img
						src={`/api/uploads/places/${place.image}?w=600&f=avif`}
						alt={place.name}
						className="max-h-48 w-full object-cover"
					/>
				) : (
					<ImageOffIcon className="size-16 text-input" />
				)}
			</div>
		</div>
	);
}

function CreatePlaceDialog({ children }: { children?: React.ReactNode }) {
	return (
		<EditDialog
			action={href("/api/create-place")}
			title="Добавление объекта"
			saveTitle="Добавить"
			fields={createPlaceFields}
		>
			{children}
		</EditDialog>
	);
}

export { PlaceDialogContext, EditPlaceDialog, CreatePlaceDialog };
