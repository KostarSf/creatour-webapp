import type { Route } from "./+types/_admin_v2.admin-v2.users";

import { createColumnHelper } from "@tanstack/react-table";

import type { User } from "@prisma-app/client";
import { PlusIcon } from "lucide-react";
import { href } from "react-router";
import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";
import type { BreadcrumbHandle } from "~/hooks/use-breadcrumb";
import { USER_ROLES } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { useUser } from "~/utils/user";
import { EditDialog, EditDialogButton, type EditableField } from "~/widgets/admin/adit-dialog";
import { DataTable, type DataTableFilter } from "~/widgets/admin/data-table";

export const handle: BreadcrumbHandle = { breadcrumb: [{ label: "Владельцы ресурсов" }] };

export const loader = async () => {
	const users = await db.user.findMany({ where: { role: USER_ROLES.placeowner.key } });
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
	columnHelper.display({
		id: "actions",
		cell: ({ row }) => (
			<div className="flex justify-end">
				<UsersTableEditDialog user={row.original} />
			</div>
		),
	}),
];

function UsersTableEditDialog({ user }: { user: User }) {
	const currentUser = useUser();

	return (
		<EditDialog
			action={href("/api/update-user")}
			title="Редактирование владельца ресурсов"
			data={user}
			fields={editableFields}
			deleteCallback={
				user.id !== currentUser.id
					? (submit) => {
							const formData = new FormData();
							formData.set("userId", user.id);

							submit(formData, { method: "POST", action: href("/api/delete-user") });
						}
					: undefined
			}
			deleteTitle={`Удалить пользователя ${user.username}?`}
			deleteDescription="Пользователь будет удален из системы. Это действие необратимо"
			searchParamsState={{ name: "edit", value: String(user.id) }}
		>
			<EditDialogButton />
		</EditDialog>
	);
}

const filters: DataTableFilter<User>[] = [{ column: "city", title: "Город" }];

const editableFields: EditableField<User>[] = [
	{
		name: "id",
		type: "hidden",
		required: true,
	},
	{
		name: "role",
		type: "hidden",
		defaultValue: USER_ROLES.placeowner.key,
		required: true,
	},
	{
		name: "username",
		title: "Имя",
		required: true,
	},
	{
		name: "email",
		title: "Email",
		type: "email",
		required: true,
	},
	{
		name: "phone",
		title: "Телефон",
	},
	{
		name: "city",
		title: "Город",
	},
	{
		name: "address",
		title: "Адрес",
	},
	{
		name: "inn",
		title: "ИНН",
	},
	{
		name: "legalName",
		title: "Наименование",
	},
];

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
		>
			<div className="flex justify-end">
				<EditDialog
					action={href("/api/create-user")}
					title="Добавление владельца ресурсов"
					saveTitle="Добавить"
					fields={editableFields}
				>
					<DialogTrigger asChild>
						<Button variant="default">
							<PlusIcon />
							<span>Новый владелец ресурсов</span>
						</Button>
					</DialogTrigger>
				</EditDialog>
			</div>
		</DataTable>
	);
}
