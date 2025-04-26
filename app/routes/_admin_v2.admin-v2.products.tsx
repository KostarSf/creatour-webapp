import type { Route } from "./+types/_admin_v2.admin-v2.products";

import { createColumnHelper } from "@tanstack/react-table";

import type { Place, Product, RoutePoint, Tag } from "@prisma-app/client";
import type { BreadcrumbHandle } from "~/hooks/use-breadcrumb";
import { db } from "~/utils/db.server";
import { DataTable, type DataTableFilter } from "~/widgets/admin/data-table";

export const handle: BreadcrumbHandle = { breadcrumb: [{ label: "Турпродукты" }] };

export const loader = async () => {
	const products = await db.product.findMany({
		include: {
			route: {
				include: {
					place: true,
				},
			},
			tags: true,
		},
	});

	return { products } satisfies { products: ProductWithRelations[] };
};

export default function AdminUsersList({ loaderData }: Route.ComponentProps) {
	return <ProductsTable data={loaderData.products} />;
}

type ProductWithRelations = Product & {
	route: (RoutePoint & { place: Place })[];
	tags: Tag[];
};

const columnHelper = createColumnHelper<ProductWithRelations>();

const columns = [
	columnHelper.accessor("id", {
		header: () => "ID",
		cell: (props) => <div title={props.getValue()}>{props.getValue().substring(0, 8)}</div>,
	}),
	columnHelper.accessor("name", {
		header: () => "Наименование",
		cell: (props) => (
			<div title={props.getValue()} className="max-w-64 overflow-hidden text-ellipsis">
				{props.getValue()}
			</div>
		),
	}),
	columnHelper.accessor("description", {
		header: () => "Описание",
		cell: (props) => (
			<div title={props.getValue() ?? ""} className="line-clamp-3 max-w-[500px] whitespace-pre-line">
				{props.getValue()}
			</div>
		),
	}),
	columnHelper.accessor("route", {
		header: () => "Объект",
		cell: (props) => {
			const place = props.getValue().at(0)?.place.name;
			return <div className="line-clamp-3 max-w-48 whitespace-pre-line">{place}</div>;
		},
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
];

const filters: DataTableFilter<ProductWithRelations>[] = [];

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
		/>
	);
}
