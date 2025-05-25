import type { Route } from "./+types/_admin_v2.admin-v2.users";

import { createColumnHelper } from "@tanstack/react-table";

import type { User } from "@prisma-app/client";
import { PlusIcon } from "lucide-react";
import { href } from "react-router";
import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";
import type { BreadcrumbHandle } from "~/hooks/use-breadcrumb";
import { USER_ROLES_LIST } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { useUser } from "~/utils/user";
import { EditDialog, EditDialogButton, type EditableField } from "~/widgets/admin/adit-dialog";
import { DataTable, type DataTableFilter } from "~/widgets/admin/data-table";

export const handle: BreadcrumbHandle = { breadcrumb: [{ label: "Пользователи" }] };

export const loader = async () => {
	const users = await db.user.findMany();
	return { users };
};

export default function AdminUsersList({ loaderData }: Route.ComponentProps) {
	return <UsersTable data={loaderData.users} />;
}

const columnHelper = createColumnHelper<User>();

const columns = [
	columnHelper.accessor("id", {
		header: () => "ID",
		cell: (props) => <div title={props.getValue()}>{props.getValue().substring(0, 8)}</div>,
	}),
	columnHelper.accessor("role", {
		header: () => "Роль",
		cell: (props) =>
			USER_ROLES_LIST.find((role) => role.key === props.getValue())?.title ?? props.getValue(),
	}),
	columnHelper.accessor("username", { header: () => "Логин", enableGlobalFilter: true }),
	columnHelper.accessor("email", { header: () => "Email", enableGlobalFilter: true }),
	columnHelper.accessor("phone", { header: () => "Телефон", enableGlobalFilter: true }),
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
			title="Редактирование пользователя"
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

const filters: DataTableFilter<User>[] = [{ column: "role", title: "Роль" }];

const editableFields: EditableField<User>[] = [
	{
		name: "id",
		type: "hidden",
		required: true,
	},
	{
		name: "role",
		title: "Роль",
		type: "select",
		values: USER_ROLES_LIST.map((role) => ({
			value: role.key,
			name: role.title,
		})),
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
		name: "age",
		title: "Возраст",
		type: "number",
		min: 1,
	},
	{
		name: "sex",
		title: "Пол",
		type: "select",
		values: [
			{ value: "-", name: "Пол не указан" },
			{ value: "male", name: "Мужской" },
			{ value: "female", name: "Женский" },
		],
		defaultValue: "-",
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
		>
			<div className="flex justify-end">
				<EditDialog
					action={href("/api/create-user")}
					title="Добавление пользователя"
					saveTitle="Добавить"
					fields={editableFields}
				>
					<DialogTrigger asChild>
						<Button variant="default">
							<PlusIcon />
							<span>Новый пользователь</span>
						</Button>
					</DialogTrigger>
				</EditDialog>
			</div>
		</DataTable>
	);
}
