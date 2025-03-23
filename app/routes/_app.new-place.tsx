import type { ComponentPropsWithRef } from "react";
import { forwardRef, useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { data, redirect } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { requireUserId } from "~/utils/session.server";

export const meta: MetaFunction = () => [{ title: "Добавление нового места | Креатур" }];

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request);
	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user || user.role !== "placeowner") {
		return data(
			{
				error: "Некорректный пользователь",
			},
			{ status: 403 },
		);
	}

	const formData = await request.formData();
	const { name, short, description, city, address, date } = Object.fromEntries(formData);

	if (
		typeof name !== "string" ||
		typeof short !== "string" ||
		typeof description !== "string" ||
		typeof city !== "string" ||
		typeof address !== "string" ||
		typeof date !== "string"
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

	await db.place.create({
		data: {
			creatorId: user.id,
			name: name.trim(),
			short: short.trim(),
			description: description.trim(),
			city: city.trim(),
			address: address.trim(),
			date: date.length !== 0 ? new Date(date).toISOString() : undefined,
		},
	});

	throw redirect("/placeowner");
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userId = await requireUserId(request);

	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user || user.role !== "placeowner") throw redirect("/");

	return { user };
};

export default function NewPlacePage() {
	const { user } = useLoaderData<typeof loader>();
	const data = useActionData<typeof action>();

	useEffect(() => {
		if (data?.error) {
			alert(data.error);
		}
	}, [data]);

	return (
		<div className="mx-auto max-w-xl">
			<h1 className="text-xl ">Добавление нового места</h1>
			<Form method="POST" className="py-6 md:py-12">
				<div className="space-y-3">
					<InputField type="text" name="name" id="name" label="Название" required />
					<InputField type="text" name="short" id="short" label="Краткое описание" />
					<InputArea name="description" id="description" label="Полное описание" />
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
					<InputField type="datetime-local" name="date" id="date" label="Дата проведения" />
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
	required?: boolean | undefined;
}

const InputArea = forwardRef<HTMLTextAreaElement, InputAreaProps>(({ label, id, ...other }, forwardedRef) => (
	<div>
		<label htmlFor={id}>{label}</label>
		<textarea
			ref={forwardedRef}
			id={id}
			className="min-h-[2.125rem] w-full rounded-sm border px-2 py-1"
			{...other}
		/>
	</div>
));
