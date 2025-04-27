import {
	type Column,
	type ColumnDef,
	type ColumnFiltersState,
	type PaginationState,
	type RowSelectionState,
	type SortingState,
	type Table as TTable,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CheckIcon,
	ChevronsUpDownIcon,
	EllipsisIcon,
	PlusCircleIcon,
	XIcon,
} from "lucide-react";
import { type PropsWithChildren, type ReactNode, useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { z } from "zod";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "~/components/ui/command";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { cn, validateSearchParams } from "~/lib/utils";

export interface DataTableFilter<TData> {
	column: keyof TData;
	title: string;
}

interface DataTableProps<TData> extends PropsWithChildren {
	data: TData[];
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	columns: ColumnDef<TData, any>[];
	className?: string;
	getRowId?: (row: TData) => string;
	filters?: DataTableFilter<TData>[];
	actionsDropdownContent?: (table: TTable<TData>) => ReactNode;
	searchLabel?: string;
	noDataLabel?: string;
	dataActionsLabel?: string;
}

function DataTable<TData>({
	data,
	columns,
	className,
	getRowId,
	filters,
	actionsDropdownContent,
	searchLabel,
	dataActionsLabel,
	noDataLabel,
	children,
}: DataTableProps<TData>) {
	// BUG: https://github.com/TanStack/table/issues/5567
	// TanStack Table не рендерит изменения в таблице с React Compiler.
	// Временное решение - выключить оптимизацию для компонента таблицы.
	// eslint-disable-next-line react-compiler/react-compiler
	"use no memo";

	const control = useSearchParamsControl();

	const [sorting, setSorting] = useState<SortingState>([]);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: control.page - 1,
		pageSize: 20,
	});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");

	const canSelect = useMemo(() => {
		return columns.findIndex((col) => col.id === "select") !== -1;
	}, [columns]);

	const table = useReactTable({
		data: data,
		columns: columns,
		getRowId: getRowId,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		onSortingChange: setSorting,
		onRowSelectionChange: setRowSelection,
		onPaginationChange: setPagination,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		autoResetPageIndex: false,
		state: {
			sorting,
			rowSelection,
			pagination,
			columnFilters,
			globalFilter,
		},
	});

	return (
		<div className={cn("space-y-4", className)}>
			<DataTableToolbar
				table={table}
				filters={filters}
				searchPlaceholder={searchLabel}
				globalFilterValue={globalFilter}
				onGlobalFilterValueChange={setGlobalFilter}
			>
				{children}
			</DataTableToolbar>
			<div className="max-h-[calc(100svh-calc(var(--spacing)*50))] overflow-auto rounded-lg border-border/50 bg-card *:overflow-x-visible">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id} colSpan={header.colSpan}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									{noDataLabel ?? "Список пуст"}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2">
				{canSelect ? (
					<div className="flex flex-1 items-center gap-6">
						<p className="text-muted-foreground text-sm">
							{table.getFilteredSelectedRowModel().rows.length} из{" "}
							{table.getFilteredRowModel().rows.length} элементов выбрано.
						</p>
						{actionsDropdownContent && table.getFilteredSelectedRowModel().rows.length > 0 ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="outline" size="sm">
										<EllipsisIcon /> Действия
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" side="top">
									<DropdownMenuLabel>
										{dataActionsLabel ?? "Действия над элементами"}
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{actionsDropdownContent(table)}
								</DropdownMenuContent>
							</DropdownMenu>
						) : null}
					</div>
				) : null}

				<div className="flex items-center space-x-6 lg:space-x-8">
					<div className="flex w-[150px] items-center justify-center font-medium text-sm">
						Страница {table.getState().pagination.pageIndex + 1} из {table.getPageCount()}
					</div>
					<div className="space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							asChild
						>
							<Link
								to={control.previousPageHref}
								aria-disabled={!table.getCanPreviousPage()}
								className={clsx(
									!table.getCanPreviousPage() && "pointer-events-none opacity-50",
								)}
							>
								Назад
							</Link>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							asChild
						>
							<Link
								to={control.nextPageHref}
								aria-disabled={!table.getCanNextPage()}
								className={clsx(!table.getCanNextPage() && "pointer-events-none opacity-50")}
							>
								Вперед
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

const searchParamsSchema = z.object({
	page: z.coerce.number().min(1).int().optional().default(1),
});

function useSearchParamsControl() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = validateSearchParams(searchParams, searchParamsSchema)?.page ?? 1;

	const nextPageSearchParams = new URLSearchParams(searchParams);
	nextPageSearchParams.set("page", String(page + 1));

	const previousPageSearchParams = new URLSearchParams(searchParams);
	previousPageSearchParams.set("page", String(page - 1));

	const setPage = (page: number) => {
		setSearchParams((params) => {
			if (page <= 1) {
				params.delete("page");
			} else {
				params.set("page", String(Math.round(page)));
			}
			return params;
		});
	};

	return {
		page,
		setPage,
		nextPageHref: `?${nextPageSearchParams}`,
		previousPageHref: `?${previousPageSearchParams}`,
	};
}

interface DataTableToolbarProps<TData> extends PropsWithChildren {
	table: TTable<TData>;
	filters?: DataTableFilter<TData>[];
	searchPlaceholder?: string;
	globalFilterValue?: string;
	onGlobalFilterValueChange?: (value: string) => void;
}

export function DataTableToolbar<TData>({
	table,
	filters,
	searchPlaceholder,
	globalFilterValue,
	onGlobalFilterValueChange,
	children,
}: DataTableToolbarProps<TData>) {
	// eslint-disable-next-line react-compiler/react-compiler
	"use no memo";

	const control = useSearchParamsControl();

	const isFiltered = table.getState().columnFilters.length > 0;

	const resetPageHandle = useCallback(() => {
		control.setPage(1);
		table.setPageIndex(0);
	}, [table, control]);

	return (
		<div className="flex flex-wrap items-start justify-between gap-2">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input
					placeholder={searchPlaceholder ?? "Поиск..."}
					value={globalFilterValue ?? ""}
					onChange={(event) => {
						onGlobalFilterValueChange?.(event.target.value);
						resetPageHandle();
					}}
					className="h-8 w-[150px] border-primary lg:w-[250px]"
				/>
				{filters?.map((filter) => {
					const column = table.getColumn(String(filter.column));

					if (!column) {
						return null;
					}

					return (
						<DataTableFacetedFilter
							key={String(filter.column)}
							column={column}
							title={filter.title}
							options={Array.from(column.getFacetedUniqueValues().keys()).map(
								(key: string) => ({
									label: key,
									value: key,
								}),
							)}
							onFilterValueChange={resetPageHandle}
						/>
					);
				})}
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						Сбросить
						<XIcon />
					</Button>
				)}
			</div>
			{children}
		</div>
	);
}

interface DataTableFacetedFilterProps<TData, TValue> {
	column?: Column<TData, TValue>;
	title?: string;
	options: {
		label: string;
		value: string;
		icon?: React.ComponentType<{ className?: string }>;
	}[];
	onFilterValueChange?: (values: string[]) => void;
}

export function DataTableFacetedFilter<TData, TValue>({
	column,
	title,
	options,
	onFilterValueChange,
}: DataTableFacetedFilterProps<TData, TValue>) {
	const facets = column?.getFacetedUniqueValues();
	const selectedValues = new Set(column?.getFilterValue() as string[]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="h-8 border-dashed">
					<PlusCircleIcon />
					{title}
					{selectedValues?.size > 0 && (
						<>
							<Separator orientation="vertical" className="mx-2 h-4" />
							<Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
								{selectedValues.size}
							</Badge>
							<div className="hidden space-x-1 lg:flex">
								{selectedValues.size > 2 ? (
									<Badge variant="secondary" className="rounded-sm px-1 font-normal">
										{selectedValues.size} выбрано
									</Badge>
								) : (
									options
										.filter((option) => selectedValues.has(option.value))
										.map((option, index) => (
											<Badge
												variant="secondary"
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
												key={index}
												className="rounded-sm px-1 font-normal"
											>
												{option.label}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<Command>
					<CommandInput placeholder={title} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup>
							{options.map((option, index) => {
								const isSelected = selectedValues.has(option.value);
								return (
									<CommandItem
										// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
										key={index}
										onSelect={() => {
											if (isSelected) {
												selectedValues.delete(option.value);
											} else {
												selectedValues.add(option.value);
											}
											const filterValues = Array.from(selectedValues);
											column?.setFilterValue(
												filterValues.length ? filterValues : undefined,
											);

											onFilterValueChange?.(filterValues);
										}}
									>
										<div
											className={cn(
												"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
												isSelected
													? "bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible",
											)}
										>
											<CheckIcon />
										</div>
										{option.icon && (
											<option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
										)}
										<span>{option.label}</span>
										{facets?.get(option.value) && (
											<span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
												{facets.get(option.value)}
											</span>
										)}
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => column?.setFilterValue(undefined)}
										className="justify-center text-center"
									>
										Очистить фильтры
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>;
	title: string;
}

function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
}: DataTableColumnHeaderProps<TData, TValue>) {
	// eslint-disable-next-line react-compiler/react-compiler
	"use no memo";

	if (!column.getCanSort()) {
		return <div className={cn("flex items-center space-x-2 whitespace-nowrap", className)}>{title}</div>;
	}

	const sorting = column.getIsSorted();

	return (
		<div className={cn("flex items-center space-x-2", className)}>
			<Button
				variant="ghost"
				size="sm"
				className={clsx("-mx-3 h-8 text-sm", sorting && "bg-accent")}
				onClick={() =>
					!sorting || sorting === "asc"
						? column.toggleSorting(sorting === "asc")
						: column.clearSorting()
				}
			>
				<span className="whitespace-nowrap">{title}</span>
				{!sorting ? (
					<ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
				) : sorting === "asc" ? (
					<ArrowUpIcon className="h-4 w-4" />
				) : (
					<ArrowDownIcon className="h-4 w-4" />
				)}
			</Button>
		</div>
	);
}

function DataTableSkeleton({ className }: { className?: string }) {
	return (
		<div className={clsx("fade-in animate-in space-y-5 duration-500", className)}>
			<div className="flex gap-2">
				<Skeleton className="h-8 w-64" />
				{/* <Skeleton className="h-8 w-24" /> */}
				{/* <Skeleton className="h-8 w-32" /> */}
			</div>
			<div className="space-y-2">
				{new Array(16).fill(null).map((_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					<Skeleton className="h-10" key={index} />
				))}
			</div>
			<div className="flex items-center justify-between py-2">
				<Skeleton className="h-4 w-48" />
				<div className="flex items-center gap-2">
					<Skeleton className="mr-6 h-4 w-28" />
					<Skeleton className="h-8 w-18" />
					<Skeleton className="h-8 w-18" />
				</div>
			</div>
		</div>
	);
}

export { DataTable, DataTableColumnHeader, DataTableSkeleton };
