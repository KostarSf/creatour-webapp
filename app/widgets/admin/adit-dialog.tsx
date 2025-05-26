import clsx from "clsx";
import { LoaderCircleIcon, PencilIcon } from "lucide-react";
import React, { Fragment, useEffect, useId, useState, type PropsWithChildren } from "react";
import { type FetcherSubmitFunction, useFetcher, useSearchParams } from "react-router";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";

type ErrorMessage = string | string[] | undefined;

export interface EditActionData {
	success: boolean;
	errors?: Record<string, ErrorMessage> & {
		detail?: string;
	};
}

export type EditActionErrors<TData> = {
	[error in keyof TData]?: ErrorMessage;
} & {
	detail?: string;
};

type InputEditableField = Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "id">;

interface TextareaEditableField
	extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "id"> {
	type: "textarea";
}

interface SelectEditableField<TData = unknown, TKey extends keyof TData = keyof TData>
	extends Omit<
		React.SelectHTMLAttributes<HTMLSelectElement>,
		"name" | "id" | "value" | "defaultValue" | "dir"
	> {
	type: "select";
	values: EditableSelectValue<TData, TKey>[];
	placeholder?: string;
	defaultValue?: string | undefined;
	dir?: "ltr" | "rtl";
}

export interface EditableSelectValue<TData, TKey extends keyof TData> {
	name: string;
	value: NonNullable<TData[TKey]>;
}

export interface CustomEditableField<TData> {
	type: "custom";
	disabled?: boolean;
	defaultValue?: string | undefined;
	required?: boolean;
	component: (data: TData | undefined) => React.ReactNode;
}

export interface SelectResourceEditableField<TResource = unknown>
	extends React.ComponentProps<typeof Select> {
	type: "select-resource";
	disabled?: boolean;
	title: string;
	defaultValue?: string | undefined;
	placeholder?: string;
	resourceHref: string;
	valueFn: (data: TResource) => string;
	nameFn?: (data: TResource) => string;
}

interface CheckboxEditableField extends Omit<React.ComponentProps<typeof Checkbox>, "type"> {
	type: "checkbox";
}

export type EditableField<TData = unknown, TKey extends keyof TData = keyof TData> = (
		| CustomEditableField<TData>
		| InputEditableField
		| TextareaEditableField
		| SelectEditableField<TData, TKey>
		| CheckboxEditableField
		| SelectResourceEditableField
	) & {
		name: TKey | (string & {});
		title?: string;
		transformValue?: (date: TData | undefined) => unknown;
	};

interface EditDialogProps<TData> extends PropsWithChildren {
	data?: TData;
	fields: EditableField<TData>[];
	title: string;
	description?: string;
	action?: string;
	header?: React.ReactNode;
	deleteCallback?: (submit: FetcherSubmitFunction) => void;
	deleteTitle?: string;
	deleteDescription?: string;
	defaultErrorMessage?: string;
	interactionsDisabled?: boolean;
	saveTitle?: string;
	searchParamsState?: { name: string; value: string };
	tabs?: { name: string; component: () => React.ReactNode }[];
}

function EditDialog<TData>({
	title,
	description,
	children,
	action,
	header,
	deleteCallback,
	deleteTitle,
	deleteDescription,
	data,
	fields,
	defaultErrorMessage,
	interactionsDisabled,
	saveTitle,
	searchParamsState,
	tabs,
}: EditDialogProps<TData>) {
	const [open, setOpen] = useOpenStateControl(searchParamsState);

	const formId = useId();
	const errorId = useId();

	const fetcher = useFetcher<() => Promise<EditActionData>>();
	const pending = fetcher.state !== "idle";

	React.useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data?.success) {
			setOpen(false);
		}

		if (fetcher.state === "idle" && fetcher.data?.success === false) {
			setOpen(true);
		}
	}, [fetcher]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{children}
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[650px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						{interactionsDisabled
							? "Форма отображена в режиме просмотра."
							: (description ?? "Внесите изменения и нажмите Сохранить для обновления данных.")}
					</DialogDescription>
				</DialogHeader>
				{header}
				<EditDialogTabs additionalTabs={tabs} className="grid gap-4">
					<fetcher.Form
						method="POST"
						action={action}
						id={formId}
						preventScrollReset
						encType="multipart/form-data"
					>
						<div className="grid gap-4 py-4">
							{fields.map((initialField) => {
								const { transformValue, ...field }: EditableField<TData, keyof TData> = {
									...initialField,
									disabled: interactionsDisabled ? true : initialField.disabled,
								};

								const name = String(field.name);
								const defaultValue = transformValue
									? transformValue(data)
									: (data?.[field.name as keyof TData] ?? field.defaultValue);
								const error = fetcher.data?.errors?.[field.name] as ErrorMessage;

								if (field.type === "hidden") {
									return (
										<Fragment key={name}>
											<input
												{...(field as InputEditableField)}
												type="hidden"
												name={name}
												value={defaultValue ? String(defaultValue) : undefined}
											/>
											{error ? (
												<p className="text-destructive text-sm">{error}</p>
											) : null}
										</Fragment>
									);
								}
								return (
									<div
										className={clsx(
											field.type === "checkbox"
												? "flex flex-row-reverse items-center justify-end gap-1.5 py-1"
												: "grid gap-1.5",
										)}
										key={name}
									>
										<Label htmlFor={name}>
											{field.title ?? name}
											{field.required ? (
												<span className="text-destructive">*</span>
											) : undefined}
										</Label>
										{field.type === "custom" ? (
											(field as CustomEditableField<TData>).component(data)
										) : field.type === "textarea" ? (
											<Textarea
												{...(field as TextareaEditableField)}
												aria-invalid={!!error}
												aria-errormessage={error ? errorId : undefined}
												id={name}
												name={name}
												defaultValue={defaultValue ? String(defaultValue) : undefined}
											/>
										) : field.type === "select" ? (
											<Select
												{...(field as SelectEditableField<TData>)}
												aria-invalid={!!error}
												aria-errormessage={error ? errorId : undefined}
												name={name}
												defaultValue={defaultValue ? String(defaultValue) : undefined}
											>
												<SelectTrigger id={name} className="w-full">
													<SelectValue
														placeholder={
															(field as SelectEditableField<TData>).placeholder
														}
													/>
												</SelectTrigger>
												<SelectContent>
													{(field as SelectEditableField<TData>).values.map(
														(value) => (
															<SelectItem
																key={String(value.value)}
																value={String(value.value)}
															>
																{value.name}
															</SelectItem>
														),
													)}
												</SelectContent>
											</Select>
										) : field.type === "select-resource" ? (
											<SelectResource
												{...(field as SelectResourceEditableField)}
												aria-invalid={!!error}
												aria-errormessage={error ? errorId : undefined}
												name={name}
												defaultValue={defaultValue ? String(defaultValue) : undefined}
											/>
										) : field.type === "checkbox" ? (
											<Checkbox
												{...(field as CheckboxEditableField)}
												type="button"
												aria-invalid={!!error}
												aria-errormessage={error ? errorId : undefined}
												id={name}
												name={name}
												defaultChecked={Boolean(defaultValue)}
											/>
										) : (
											<Input
												{...(field as InputEditableField)}
												aria-invalid={!!error}
												aria-errormessage={error ? errorId : undefined}
												id={name}
												name={name}
												defaultValue={defaultValue ? String(defaultValue) : undefined}
											/>
										)}
										{error ? (
											<p id={errorId} className="text-destructive text-sm">
												{error}
											</p>
										) : null}
									</div>
								);
							})}
							{fetcher.data?.success === false ? (
								<p className="text-destructive text-sm">
									{fetcher.data.errors?.detail ??
										defaultErrorMessage ??
										"Не удалось сохранить данные."}
								</p>
							) : null}
						</div>
					</fetcher.Form>
					{!interactionsDisabled ? (
						<DialogFooter>
							<DialogClose asChild>
								<Button type="button" variant="outline">
									Отмена
								</Button>
							</DialogClose>
							{deleteCallback ? (
								<div className="grid sm:order-first sm:flex-1">
									<DeleteActionButton
										callback={deleteCallback}
										title={deleteTitle}
										description={deleteDescription}
									/>
								</div>
							) : null}
							<Button type="submit" form={formId} disabled={pending} className="sm:w-32">
								{pending ? (
									<LoaderCircleIcon className="animate-spin" />
								) : (
									(saveTitle ?? "Сохранить")
								)}
							</Button>
						</DialogFooter>
					) : null}
				</EditDialogTabs>
			</DialogContent>
		</Dialog>
	);
}

interface EditDialogTabsProps extends React.PropsWithChildren {
	additionalTabs?: { name: string; component: () => React.ReactNode }[];
	className?: string;
}

function EditDialogTabs({ children, additionalTabs, className }: EditDialogTabsProps) {
	if (!additionalTabs?.length) {
		return children;
	}

	return (
		<Tabs defaultValue="main-form">
			<TabsList>
				<TabsTrigger value="main-form">Основная информация</TabsTrigger>
				{additionalTabs.map((tab) => (
					<TabsTrigger key={tab.name} value={tab.name}>
						{tab.name}
					</TabsTrigger>
				))}
			</TabsList>
			<TabsContent value="main-form" className={className}>
				{children}
			</TabsContent>
			{additionalTabs.map((tab) => (
				<TabsContent key={tab.name} value={tab.name} className={className}>
					{tab.component()}
				</TabsContent>
			))}
		</Tabs>
	);
}

function SelectResource({
	valueFn,
	nameFn = valueFn,
	resourceHref,
	placeholder,
	name,
	...props
}: SelectResourceEditableField) {
	const fetcher = useFetcher();

	React.useEffect(() => {
		fetcher.load(resourceHref);
	}, []);

	const values = Array.isArray(fetcher.data)
		? fetcher.data.map((item) => ({
				value: valueFn(item),
				name: nameFn(item),
			}))
		: [];

	return (
		<Select {...props} name={name}>
			<SelectTrigger id={name} className="relative w-full">
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{values.map((value) => (
					<SelectItem key={String(value.value)} value={String(value.value)}>
						{value.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function useOpenStateControl(searchParamsStateOptions?: { name: string; value: string }) {
	const [openState, setOpenState] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();

	if (!searchParamsStateOptions) {
		return [openState, setOpenState] as const;
	}

	const open = searchParams.get(searchParamsStateOptions.name) === searchParamsStateOptions.value;
	const setOpen = (newOpen: boolean | ((prevOpen: boolean) => boolean)) => {
		const newOpenResolved = typeof newOpen === "boolean" ? newOpen : newOpen(open);
		setSearchParams(
			(sp) => {
				if (newOpenResolved) {
					sp.set(searchParamsStateOptions.name, searchParamsStateOptions.value);
				} else {
					sp.delete(searchParamsStateOptions.name);
				}
				return sp;
			},
			{ preventScrollReset: true, replace: true },
		);
	};

	return [open, setOpen] as const;
}

interface DeleteActionButtonProps {
	className?: string;
	callback: (submit: FetcherSubmitFunction) => void;
	title?: string;
	description?: string;
}

function DeleteActionButton({ callback, className, title, description }: DeleteActionButtonProps) {
	const fetcher = useFetcher();
	const pending = fetcher.state !== "idle";

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					type="button"
					variant="destructive"
					disabled={pending}
					className={clsx("sm:w-24", className)}
				>
					{pending ? <LoaderCircleIcon className="animate-spin" /> : "Удалить"}
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title ?? "Удалить объект?"}</AlertDialogTitle>
					<AlertDialogDescription>
						{description ?? "Объект будет удален. Данное действие необратимо."}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Отмена</AlertDialogCancel>
					<AlertDialogAction disabled={pending} onClick={() => callback(fetcher.submit)}>
						Продолжить
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

function EditDialogButton() {
	return (
		<DialogTrigger asChild>
			<Button variant="ghost" className="size-8 p-0 transition">
				<PencilIcon />
			</Button>
		</DialogTrigger>
	);
}

export { EditDialog, EditDialogButton };
