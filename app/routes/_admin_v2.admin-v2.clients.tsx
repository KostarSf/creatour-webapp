import type { Route } from "./+types/_admin_v2.admin-v2.users";

import { createColumnHelper } from "@tanstack/react-table";

import type { User } from "@prisma-app/client";
import type { BreadcrumbHandle } from "~/hooks/use-breadcrumb";
import { db } from "~/utils/db.server";
import { DataTable, type DataTableFilter } from "~/widgets/admin/data-table";

export const handle: BreadcrumbHandle = { breadcrumb: [{ label: "Клиенты" }] };

export const loader = async () => {
	const users = await db.user.findMany({ where: { role: "user" } });
	return { users };
};

export default function AdminUsersList({ loaderData }: Route.ComponentProps) {
	return <ClientsTable data={loaderData.users} />;
}

const columnHelper = createColumnHelper<User>();

const columns = [
	columnHelper.accessor("id", {
		header: () => "ID",
		cell: (props) => <div title={props.getValue()}>{props.getValue().substring(0, 8)}</div>,
	}),
	columnHelper.accessor("username", { header: () => "Логин", enableGlobalFilter: true }),
	columnHelper.accessor("email", { header: () => "Email", enableGlobalFilter: true }),
	columnHelper.accessor("phone", { header: () => "Телефон", enableGlobalFilter: true }),
];

const filters: DataTableFilter<User>[] = [{ column: "role", title: "Роль" }];

interface UsersTableProps {
	data: User[];
	className?: string;
}

function ClientsTable({ data, className }: UsersTableProps) {
	return (
		<DataTable
			className={className}
			data={data}
			columns={columns}
			getRowId={(detail) => String(detail.id)}
			filters={filters}
			searchLabel="Поиск клиентов..."
			noDataLabel="Клиентов не найдено"
		/>
	);
}
