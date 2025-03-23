import type { ComponentPropsWithRef, ReactNode } from "react";
import { forwardRef, useEffect } from "react";
import type {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	MetaFunction,
} from "react-router";
import { data, redirect } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { requireUserId } from "~/utils/session.server";

export const meta: MetaFunction = () => [
	{ title: "Добавление нового турпродукта | Креатур" },
];

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user || user.role !== "creator") {
		return data(
			{
				error: "Некорректный пользователь",
			},
			{ status: 403 },
		);
	}

	const formData = await request.formData();
	const {
		name,
		type,
		price,
		short,
		description,
		city,
		address,
		beginDate,
		endDate,
	} = Object.fromEntries(formData);

	if (
		typeof name !== "string" ||
		typeof short !== "string" ||
		typeof description !== "string" ||
		typeof city !== "string" ||
		typeof address !== "string" ||
		typeof beginDate !== "string" ||
		typeof endDate !== "string" ||
		(type !== "excursion" &&
			type !== "tour" &&
			type !== "quest" &&
			type !== "event") ||
		typeof price !== "string" ||
		Number.isNaN(Number(price))
	) {
		return badRequest({
			error: "Форма неверно отправлена",
		});
	}

	if (name.trim().length < 3) {
		return badRequest({
			error: "Имя слишком короткое",
		});
	}

	await db.product.create({
		data: {
			creatorId: user.id,
			price: Math.max(0, Math.ceil(Number(price))),
			name: name.trim(),
			short: short.trim(),
			description: description.trim(),
			type: type,
			city: city.trim(),
			address: address.trim(),
			beginDate:
				beginDate.length !== 0 ? new Date(beginDate).toISOString() : undefined,
			endDate:
				endDate.length !== 0 ? new Date(endDate).toISOString() : undefined,
		},
	});

	throw redirect("/creator");
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);

	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user || user.role !== "creator") throw redirect("/");

	return { user };
};

export default function NewProductPage() {
	const { user } = useLoaderData<typeof loader>();
	const data = useActionData<typeof action>();

	useEffect(() => {
		if (data?.error) {
			alert(data.error);
		}
	}, [data]);

	return (
		<div className="mx-auto max-w-xl">
			<h1 className="text-xl ">Добавление нового турпродукта</h1>
			<Form method="POST" className="py-6 md:py-12">
				<div className="space-y-3">
					<InputSelect label="Тип продукта" name="type" id="type" required>
						<option value="excursion">Экскурсия</option>
						<option value="tour">Тур</option>
						<option value="quest">Мероприятие</option>
						<option value="event">Событие</option>
					</InputSelect>
					<InputField
						type="text"
						name="name"
						id="name"
						label="Название"
						required
					/>
					<InputField
						type="text"
						name="short"
						id="short"
						label="Краткое описание"
					/>
					<InputArea
						name="description"
						id="description"
						label="Полное описание"
					/>
					<InputField
						type="number"
						placeholder="Бесплатно"
						name="price"
						id="price"
						label="Цена"
					/>
				</div>
				<div className="mt-6 space-y-3">
					<InputField
						type="text"
						name="city"
						id="city"
						label="Город"
						defaultValue={user.city || undefined}
						required
					/>
					<InputField type="text" name="address" id="address" label="Адрес" />
					<InputField
						type="datetime-local"
						name="beginDate"
						id="beginDate"
						label="Дата начала"
						required
					/>
					<InputField
						type="datetime-local"
						name="endDate"
						id="endDate"
						label="Дата окончания"
						required
					/>
				</div>
				<div className="mt-12">
					<button
						type="submit"
						className="w-full rounded-sm bg-blue-100 px-4 py-2 font-medium text-blue-600 uppercase transition-colors hover:bg-blue-200"
					>
						Добавить
					</button>
				</div>
			</Form>
		</div>
	);
}

interface InputFieldProps extends ComponentPropsWithRef<"input"> {
	label: string;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
	({ label, id, required, ...other }, forwardedRef) => (
		<div className="flex flex-col">
			<p className="space-x-1">
				<label htmlFor={id}>{label + (required ? " *" : "")}</label>
			</p>
			<input
				required={required}
				ref={forwardedRef}
				id={id}
				className="w-full rounded-sm border px-2 py-1"
				{...other}
			/>
		</div>
	),
);

interface InputAreaProps extends ComponentPropsWithRef<"textarea"> {
	label: string;
}

const InputArea = forwardRef<HTMLTextAreaElement, InputAreaProps>(
	({ label, id, ...other }, forwardedRef) => (
		<div>
			<label htmlFor={id}>{label}</label>
			<textarea
				ref={forwardedRef}
				id={id}
				className="min-h-[2.125rem] w-full rounded-sm border px-2 py-1"
				{...other}
			/>
		</div>
	),
);

interface InputSelectProps extends ComponentPropsWithRef<"select"> {
	label: string;
	children?: ReactNode | ReactNode[];
}

const InputSelect = forwardRef<HTMLSelectElement, InputSelectProps>(
	({ label, id, children, ...other }, forwardedRef) => (
		<div>
			<label htmlFor={id}>{label}</label>
			<select
				ref={forwardedRef}
				id={id}
				className="w-full rounded-sm border bg-white px-2 py-1"
				{...other}
			>
				{children}
			</select>
		</div>
	),
);
