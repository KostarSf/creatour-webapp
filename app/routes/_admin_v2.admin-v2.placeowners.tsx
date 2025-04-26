import type { Route } from "./+types/_admin_v2.admin-v2.users";

import { createColumnHelper } from "@tanstack/react-table";

import type { User } from "@prisma-app/client";
import type { BreadcrumbHandle } from "~/hooks/use-breadcrumb";
import { db } from "~/utils/db.server";
import { DataTable, type DataTableFilter } from "~/widgets/admin/data-table";

export const handle: BreadcrumbHandle = { breadcrumb: [{ label: "Владельцы ресурсов" }] };

export const loader = async () => {
	const users = await db.user.findMany({ where: { role: "placeowner" } });
	return { users };
};

export default function AdminUsersList({ loaderData }: Route.ComponentProps) {
	return <PlaceownersTable data={loaderData.users} />;
}

const columnHelper = createColumnHelper<User>();

const columns = [
	columnHelper.accessor("id", {
		header: () => "ID",
		cell: (props) => <div title={props.getValue()}>{props.getValue().substring(0, 8)}</div>,
	}),
	columnHelper.accessor("phone", { header: () => "Телефон", enableGlobalFilter: true }),
	columnHelper.accessor("city", { header: () => "Город" }),
	columnHelper.accessor("address", { header: () => "Адрес" }),
	columnHelper.accessor("inn", { header: () => "ИНН", enableGlobalFilter: true }),
	columnHelper.accessor("legalName", { header: () => "Наименование", enableGlobalFilter: true }),
];

const filters: DataTableFilter<User>[] = [{ column: "city", title: "Город" }];

interface UsersTableProps {
	data: User[];
	className?: string;
}

function PlaceownersTable({ data, className }: UsersTableProps) {
	return (
		<DataTable
			className={className}
			data={data}
			columns={columns}
			getRowId={(detail) => String(detail.id)}
			filters={filters}
			searchLabel="Поиск владельцев..."
			noDataLabel="Владельцев не найдено"
		/>
	);
}
