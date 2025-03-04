import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	const form = await request.formData();

	const redirectTo = form.get("redirectTo");
	const parentType = form.get("parentType");
	const parentId = form.get("parentId");
	const userId = form.get("userId");
	const value = form.get("value");

	if (
		typeof redirectTo !== "string" ||
		typeof parentType !== "string" ||
		typeof parentId !== "string" ||
		typeof userId !== "string" ||
		typeof value !== "string"
	) {
		return badRequest({
			fieldErrors: null,
			fields: null,
			formError: "Форма неверно отправлена.",
		});
	}

	const fields = {
		redirectTo,
		parentType,
		parentId,
		userId,
		value: Number(value.trim()),
	};

	if (Number.isNaN(fields.value) || fields.value < 1 || fields.value > 10) {
		return badRequest({
			fieldErrors: null,
			fields: fields,
			formError: "Укажите число больше 0 и меньше 10 в качестве оценки.",
		});
	}

	if (parentType !== "product" && parentType !== "place") {
		return badRequest({
			fieldErrors: null,
			fields: fields,
			formError: `Неверный тип родителя комментария - ${parentType}.`,
		});
	}

	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user) {
		return badRequest({
			fieldErrors: null,
			fields: fields,
			formError: `Пользователя с Id ${userId} не существует.`,
		});
	}

	if (parentType === "place") {
		const place = await db.place.findUnique({ where: { id: parentId } });
		if (!place) {
			return badRequest({
				fieldErrors: null,
				fields: fields,
				formError: `Места с Id ${userId} не существует.`,
			});
		}
	} else {
		const product = await db.product.findUnique({ where: { id: parentId } });
		if (!product) {
			return badRequest({
				fieldErrors: null,
				fields: fields,
				formError: `Турпродукта с Id ${userId} не существует.`,
			});
		}
	}

	const alreadyRated = await db.rating.findFirst({
		where: {
			userId,
			placeId: parentType === "place" ? parentId : null,
			productId: parentType === "product" ? parentId : null,
		},
	});

	if (alreadyRated) {
		await db.rating.update({
			where: { id: alreadyRated.id },
			data: {
				value: fields.value,
			},
		});
	} else {
		await db.rating.create({
			data: {
				userId,
				value: fields.value,
				placeId: parentType === "place" ? parentId : null,
				productId: parentType === "product" ? parentId : null,
			},
		});
	}

	return redirect(redirectTo);
};
