import type { Route } from "./+types/_admin_v2.admin-v2.products";

import { createColumnHelper } from "@tanstack/react-table";

import type { Media, Place, Product, RoutePoint, Tag, User } from "@prisma-app/client";
import { CheckIcon, PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";
import type { BreadcrumbHandle } from "~/hooks/use-breadcrumb";
import { PRODUCT_TYPES, type ProductTypes } from "~/lib/product-types";
import { USER_ROLES } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { EditDialogButton } from "~/widgets/admin/adit-dialog";
import { DataTable, type DataTableFilter } from "~/widgets/admin/data-table";
import {
	CreateProductDialog,
	EditProductDialog,
	ProductDialogContext,
} from "~/widgets/admin/edit-product-dialog";

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
	return <ProductsTable data={loaderData.products} creators={loaderData.creators} places={loaderData.places} />;
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
				<EditProductDialog product={row.original}>
					<EditDialogButton />
				</EditProductDialog>
			</div>
		),
	}),
];

const filters: DataTableFilter<ProductWithRelations>[] = [{ column: "type", title: "Тип" }];

interface UsersTableProps {
	data: ProductWithRelations[];
	creators: User[];
	places: Place[];
	className?: string;
}

function ProductsTable({ data, className, creators, places }: UsersTableProps) {
	return (
		<ProductDialogContext value={{ creators, places }}>
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
					<CreateProductDialog>
						<DialogTrigger asChild>
							<Button variant="default">
								<PlusIcon />
								<span>Новый турпродукт</span>
							</Button>
						</DialogTrigger>
					</CreateProductDialog>
				</div>
			</DataTable>
		</ProductDialogContext>
	);
}
