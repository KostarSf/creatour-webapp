import type { Route } from "./+types/_admin_v2.admin-v2.places";

import type { Media, Place, Tag, User } from "@prisma-app/client";
import { createColumnHelper } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { DialogTrigger } from "~/components/ui/dialog";
import type { BreadcrumbHandle } from "~/hooks/use-breadcrumb";
import { USER_ROLES } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { EditDialogButton } from "~/widgets/admin/adit-dialog";
import { DataTable, type DataTableFilter } from "~/widgets/admin/data-table";
import { CreatePlaceDialog, EditPlaceDialog, PlaceDialogContext } from "~/widgets/admin/edit-place-dialog";

export const handle: BreadcrumbHandle = { breadcrumb: [{ label: "Турпродукты" }] };

export const loader = async () => {
	const [places, placeowners] = await db.$transaction([
		db.place.findMany({
			include: {
				media: true,
				tags: true,
			},
		}),
		db.user.findMany({
			where: { role: USER_ROLES.placeowner.key },
		}),
	]);
	return { places, placeowners } satisfies { places: PlaceWithRelations[]; placeowners: User[] };
};

export default function AdminPlacesList({ loaderData }: Route.ComponentProps) {
	return <PlacesTable data={loaderData.places} placeowners={loaderData.placeowners} />;
}

type PlaceWithRelations = Place & {
	media: Media[];
	tags: Tag[];
};

const columnHelper = createColumnHelper<PlaceWithRelations>();

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
		enableGlobalFilter: true,
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
				<EditPlaceDialog place={row.original}>
					<EditDialogButton />
				</EditPlaceDialog>
			</div>
		),
	}),
];

const filters: DataTableFilter<PlaceWithRelations>[] = [];

interface UsersTableProps {
	data: PlaceWithRelations[];
	placeowners: User[];
	className?: string;
}

function PlacesTable({ data, placeowners, className }: UsersTableProps) {
	return (
		<PlaceDialogContext value={{ placeowners }}>
			<DataTable
				className={className}
				data={data}
				columns={columns}
				getRowId={(detail) => String(detail.id)}
				filters={filters}
				searchLabel="Поиск объектов..."
				noDataLabel="Объектов не найдено"
			>
				<div className="flex justify-end">
					<CreatePlaceDialog>
						<DialogTrigger asChild>
							<Button variant="default">
								<PlusIcon />
								<span>Новый объект</span>
							</Button>
						</DialogTrigger>
					</CreatePlaceDialog>
				</div>
			</DataTable>
		</PlaceDialogContext>
	);
}
