import type { User } from "@prisma-app/client";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable, type DataTableFilter } from "./data-table";

const columnHelper = createColumnHelper<User>();

const columns = [
	columnHelper.accessor("id", { header: () => "ID", enableGlobalFilter: true }),
	columnHelper.accessor("role", { header: () => "Роль" }),
	columnHelper.accessor("username", { header: () => "Логин", enableGlobalFilter: true }),
	columnHelper.accessor("email", { header: () => "Email", enableGlobalFilter: true }),
	columnHelper.accessor("phone", { header: () => "Телефон", enableGlobalFilter: true }),
];

const filters: DataTableFilter<User>[] = [{ column: "role", title: "Роль" }];

interface UsersTableProps {
	data: User[];
	className?: string;
}

function UsersTable({ data, className }: UsersTableProps) {
	return (
		<DataTable
			className={className}
			data={data}
			columns={columns}
			getRowId={(detail) => String(detail.id)}
			filters={filters}
			searchLabel="Поиск пользователей..."
			noDataLabel="Пользователей не найдено"
		/>
	);
}

export { UsersTable };
