import type { Route } from "./+types/_admin_v2.admin-v2.feedback";

import { createColumnHelper } from "@tanstack/react-table";

import type { Feedback } from "@prisma-app/client";
import type { BreadcrumbHandle } from "~/hooks/use-breadcrumb";
import { db } from "~/utils/db.server";
import { DataTable, type DataTableFilter } from "~/widgets/admin/data-table";

export const handle: BreadcrumbHandle = { breadcrumb: [{ label: "Обратная связь" }] };

export const loader = async () => {
	const feedback = await db.feedback.findMany();
	return { feedback };
};

export default function AdminUsersList({ loaderData }: Route.ComponentProps) {
	return <FeedbackTable data={loaderData.feedback} />;
}

const columnHelper = createColumnHelper<Feedback>();

const columns = [
	columnHelper.accessor("id", {
		header: () => "ID",
		cell: (props) => <div title={props.getValue()}>{props.getValue().substring(0, 8)}</div>,
	}),
	columnHelper.accessor("name", {
		header: () => "Имя",
	}),
	columnHelper.accessor("email", {
		header: () => "Email",
	}),
	columnHelper.accessor("content", {
		header: () => "Сообщение",
	}),
	columnHelper.accessor("createdAt", {
		header: () => "Дата",
		cell: (props) => <div>{props.getValue().toLocaleString("ru")}</div>,
	}),
];

const filters: DataTableFilter<Feedback>[] = [];

interface UsersTableProps {
	data: Feedback[];
	className?: string;
}

function FeedbackTable({ data, className }: UsersTableProps) {
	return (
		<DataTable
			className={className}
			data={data}
			columns={columns}
			getRowId={(detail) => String(detail.id)}
			filters={filters}
			searchLabel="Поиск фидбека..."
			noDataLabel="Фидбека не найдено"
		/>
	);
}
