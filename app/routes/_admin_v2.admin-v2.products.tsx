import type { Route } from "./+types/_admin_v2.admin-v2.products";

import { createColumnHelper } from "@tanstack/react-table";

import type { Media, Place, Product, RoutePoint, Tag, User } from "@prisma-app/client";
import clsx from "clsx";
import { CheckCheckIcon, CheckIcon, ImageOffIcon, PlusIcon } from "lucide-react";
import { Form, Link, href, useFetcher, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import type { BreadcrumbHandle } from "~/hooks/use-breadcrumb";
import { PRODUCT_TYPES, PRODUCT_TYPES_LIST, type ProductTypes } from "~/lib/product-types";
import { USER_ROLES } from "~/lib/user-roles";
import { getLocalDate } from "~/lib/utils";
import { db } from "~/utils/db.server";
import { EditDialog, EditDialogButton, type EditableField } from "~/widgets/admin/adit-dialog";
import { DataTable, type DataTableFilter } from "~/widgets/admin/data-table";

export const handle: BreadcrumbHandle = { breadcrumb: [{ label: "Турпродукты" }] };

export const loader = async () => {
	const [products, places, creators] = await db.$transaction([
		db.product.findMany({
			include: {
				route: {
					include: {
						place: true,
					},
				},
				media: true,
				tags: true,
			},
		}),
		db.place.findMany(),
		db.user.findMany({
			where: {
				role: USER_ROLES.creator.key,
			},
		}),
	]);

	return { products, places, creators } satisfies {
		products: ProductWithRelations[];
		places: Place[];
		creators: User[];
	};
};

export default function AdminUsersList({ loaderData }: Route.ComponentProps) {
	return <ProductsTable data={loaderData.products} />;
}

type ProductWithRelations = Product & {
	route: (RoutePoint & { place: Place })[];
	media: Media[];
	tags: Tag[];
};

const columnHelper = createColumnHelper<ProductWithRelations>();

const columns = [
	columnHelper.accessor("id", {
		header: () => "ID",
		cell: (props) => <div title={props.getValue()}>{props.getValue().substring(0, 8)}</div>,
	}),
	columnHelper.accessor("active", {
		header: () => "Активен",
		cell: (props) => (props.getValue() ? <CheckIcon /> : undefined),
	}),
	columnHelper.accessor("type", {
		header: () => "Тип",
		cell: (props) => PRODUCT_TYPES[props.getValue() as ProductTypes]?.title ?? props.getValue(),
	}),
	columnHelper.accessor("name", {
		header: () => "Наименование",
		cell: (props) => (
			<div title={props.getValue()} className="max-w-64 overflow-hidden text-ellipsis">
				{props.getValue()}
			</div>
		),
	}),
	columnHelper.accessor("price", {
		header: () => <div className="pr-2 text-right">Стоимость</div>,
		cell: (props) => <div className="pr-2 text-right">{props.getValue().toLocaleString("ru")}</div>,
	}),
	columnHelper.accessor("beginDate", {
		header: () => "Дата и время",
		cell: (props) => <div>{props.getValue()?.toLocaleString("ru")}</div>,
	}),
	columnHelper.accessor("address", {
		header: () => "Адрес",
		cell: (props) => (
			<div title={props.getValue() ?? ""} className="line-clamp-3 max-w-56 whitespace-pre-line">
				{props.getValue()}
			</div>
		),
	}),
	columnHelper.accessor("tags", {
		header: () => "Теги",
		cell: (props) => (
			<div className="flex flex-wrap gap-x-2">
				{props.getValue().map((tag) => (
					<span key={tag.id}>#{tag.name}</span>
				))}
			</div>
		),
	}),
	columnHelper.display({
		id: "actions",
		cell: ({ row }) => (
			<div className="flex justify-end">
				<EditDialog
					header={<EditProductDialogHeader product={row.original} />}
					action={href("/api/update-product")}
					title="Редактирование турпродукта"
					data={row.original}
					fields={editableFields}
					deleteCallback={(submit) => {
						const formData = new FormData();
						formData.set("productId", row.original.id);

						submit(formData, { method: "POST", action: href("/api/delete-product") });
					}}
					deleteTitle={`Удалить турпродукт ${row.original.name}?`}
					deleteDescription="Турпродукт будет удален из системы. Это действие необратимо"
					searchParamsState={{ name: "edit", value: String(row.original.id) }}
					tabs={[
						{ name: "Галерея", component: () => <ProductMediaTab product={row.original} /> },
						{ name: "Объекты", component: () => <ProductObjectsTab product={row.original} /> },
					]}
				>
					<EditDialogButton />
				</EditDialog>
			</div>
		),
	}),
];

function EditProductDialogHeader({ product }: { product: Product }) {
	return (
		<div className="grid gap-1.5">
			<p className="text-sm leading-none">Изображение турпродукта</p>
			<div
				className={clsx(
					"grid h-48 place-items-center overflow-hidden rounded-lg border",
					product.image ? "bg-white" : "bg-secondary",
				)}
			>
				{product.image ? (
					<img
						src={`/api/uploads/products/${product.image}`}
						alt={product.name}
						className="max-h-48 w-full object-cover"
					/>
				) : (
					<ImageOffIcon className="size-16 text-input" />
				)}
			</div>
		</div>
	);
}

function ProductMediaTab({ product }: { product: ProductWithRelations }) {
	const fetcher = useFetcher();

	return (
		<div>
			<div className="flex flex-col gap-1">
				{product.media.length > 0 ? (
					product.media.map((media) => (
						<div key={media.id} className="flex gap-2">
							{media.type === "image" ? (
								<img
									src={`/api/uploads${media.url}`}
									alt={media.name || "media"}
									className="w-64 rounded-md"
								/>
							) : (
								// biome-ignore lint/a11y/useMediaCaption: <explanation>
								<video src={`/api/uploads${media.url}`} className="w-64 rounded-md" loop />
							)}
							<div>
								<p>
									<b>{media.community ? "От коммьюнити" : media.name}</b>
								</p>
								<p>{media.description}</p>
								<fetcher.Form
									method="delete"
									action={href("/api/media")}
									onSubmit={(e) => {
										if (!confirm("Удалить медиафайл?")) {
											e.preventDefault();
										}
									}}
									preventScrollReset
								>
									<input type="hidden" name="id" value={media.id} />
									<button type="submit" className="text-red-600 hover:underline">
										Удалить
									</button>
								</fetcher.Form>
							</div>
						</div>
					))
				) : (
					<p>Здесь пока пусто</p>
				)}
			</div>
			<Card className="mt-4">
				<CardHeader>
					<CardTitle>Добавить медиа</CardTitle>
				</CardHeader>
				<CardContent>
					<fetcher.Form
						id="add-media-form"
						method="post"
						action={href("/api/media")}
						encType="multipart/form-data"
						className="flex flex-col gap-2"
						preventScrollReset
					>
						<input type="hidden" name="parentType" value="product" required />
						<input type="hidden" name="parentId" value={product.id} required />
						<Input type="file" name="media" accept=".png,.jpg,.jpeg,.webp,.webm,.mp4" required />
						<Input type="text" name="name" placeholder="Название (не обязательно)" />
						<Textarea
							name="description"
							className="border"
							placeholder="Описание (не обязательно)"
						/>
					</fetcher.Form>
					<p className="font-mono text-muted-foreground text-sm">
						{fetcher.data ? JSON.stringify(fetcher.data) : undefined}
					</p>
				</CardContent>
				<CardFooter>
					<Button form="add-media-form" type="submit">
						Добавить
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

function ProductObjectsTab({ product }: { product: ProductWithRelations }) {
	const { places } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	return (
		<div>
			{product.route.length === 0 ? (
				<p>Не задана</p>
			) : (
				<div className="space-y-2">
					{product.route.map((point) => (
						<p key={point.placeId} className="flex items-baseline gap-2 rounded-md border p-4">
							<fetcher.Form
								method="post"
								className="flex flex-wrap items-baseline gap-2"
								action={href("/admin/products/:productId", { productId: product.id })}
								preventScrollReset
							>
								<Input
									type="number"
									name="order"
									defaultValue={point.order}
									className="w-16"
								/>
								<Link
									to={`/admin/places/${point.placeId}`}
									className="text-blue-600 hover:underline"
								>
									<p>{point.place.name}</p>
								</Link>
								<Input
									type="datetime-local"
									name="date"
									defaultValue={point.date ? getLocalDate(new Date(point.date)) : undefined}
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
							</fetcher.Form>
							<fetcher.Form
								method="post"
								className="flex gap-2"
								action={href("/admin/products/:productId", { productId: product.id })}
								onSubmit={(e) => {
									if (!confirm("Удалить точку маршрута?")) {
										e.preventDefault();
									}
								}}
								preventScrollReset
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
							</fetcher.Form>
						</p>
					))}
				</div>
			)}

			<Card className="mt-4">
				<CardHeader>
					<CardTitle>Добавить объект</CardTitle>
				</CardHeader>
				<CardContent>
					<fetcher.Form
						id="add-place-form"
						method="post"
						action={href("/admin/products/:productId", { productId: product.id })}
						preventScrollReset
					>
						<Select name="place" defaultValue={places.at(0)?.id}>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{places.map((place) => (
									<SelectItem key={place.id} value={place.id}>
										{place.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</fetcher.Form>
					<p className="font-mono text-muted-foreground text-sm">{JSON.stringify(fetcher.data)}</p>
				</CardContent>
				<CardFooter>
					<Button form="add-place-form" type="submit" name="intent" value="addplace">
						Добавить
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}

const filters: DataTableFilter<ProductWithRelations>[] = [{ column: "type", title: "Тип" }];

const createProductFields: EditableField<ProductWithRelations>[] = [
	{
		name: "creatorId",
		type: "custom",
		title: "Создатель турпродукта",
		component: (product) => <UsersSelect defaultId={product?.creatorId} />,
		required: true,
	},
	{
		name: "type",
		type: "select",
		title: "Тип",
		required: true,
		values: PRODUCT_TYPES_LIST.map((type) => ({ value: type.key, name: type.title })),
	},
	{ name: "name", title: "Наименование", required: true },
	{
		name: "tags",
		title: "Теги (через запятую)",
		transformValue: (product) => product?.tags.map((tag) => tag.name).join(", "),
	},
	{ name: "price", type: "number", title: "Стоимость" },
	{ name: "short", title: "Краткое описание" },
	{ name: "description", type: "textarea", title: "Описание" },
	{
		name: "beginDate",
		type: "datetime-local",
		title: "Дата начала",
		transformValue: (product) => {
			const date = product?.beginDate;
			if (!date) return undefined;
			return getLocalDate(date);
		},
		required: true,
	},
	{
		name: "endDate",
		type: "datetime-local",
		title: "Дата окончания",
		transformValue: (product) => {
			const date = product?.endDate;
			if (!date) return undefined;
			return getLocalDate(date);
		},
		required: true,
	},
	{ name: "city", title: "Город" },
	{ name: "address", title: "Адрес" },
	{ name: "coordinates", title: "Координаты (широта, долгота)" },
];

const editableFields: EditableField<ProductWithRelations>[] = [
	{ name: "id", type: "hidden", required: true },
	{
		name: "newImage",
		title: "Новое изображение",
		type: "file",
		accept: "image/avif,image/webp,image/jpeg,image/png",
	},
	{ name: "active", type: "checkbox", title: "Турпродукт активен" },
	...createProductFields,
];

function UsersSelect({ defaultId }: { defaultId?: string }) {
	const { creators } = useLoaderData<typeof loader>();

	return (
		<Select name="creatorId" defaultValue={defaultId}>
			<SelectTrigger id="creatorId" className="w-full">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{creators.map((creator) => (
					<SelectItem key={creator.id} value={creator.id}>
						{creator.legalName} ({creator.username})
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

interface UsersTableProps {
	data: ProductWithRelations[];
	className?: string;
}

function ProductsTable({ data, className }: UsersTableProps) {
	return (
		<DataTable
			className={className}
			data={data}
			columns={columns}
			getRowId={(detail) => String(detail.id)}
			filters={filters}
			searchLabel="Поиск турпродуктов..."
			noDataLabel="Турпродуктов не найдено"
		>
			<div className="flex justify-end">
				<EditDialog
					action={href("/api/create-product")}
					title="Добавление турпродукта"
					saveTitle="Добавить"
					fields={createProductFields}
				>
					<DialogTrigger asChild>
						<Button variant="default">
							<PlusIcon />
							<span>Новый турпродукт</span>
						</Button>
					</DialogTrigger>
				</EditDialog>
			</div>
		</DataTable>
	);
}
