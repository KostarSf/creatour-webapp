import type { Route } from "./+types/api.send-feedback";

import { data } from "react-router";
import { z } from "zod";

import { createFeedback } from "~/models/feedback";
import { sendMessage } from "~/utils/tg-bot";

const feedbackSchema = z.interface({
	name: z.string().min(2),
	email: z.email(),
	content: z.string(),
});

export const action = async ({ request }: Route.ActionArgs) => {
	const formData = await request.formData();
	const result = feedbackSchema.safeParse(Object.fromEntries(formData));

	if (!result.success) {
		return data({ success: false }, 400);
	}

	const feedback = await createFeedback(result.data);
	sendMessage(`
Новый фидбек с сайта!

Имя: ${feedback.name}
Почта: ${feedback.email}

${feedback.content}
	`);

	return data({ success: true });
};

export type SendFeedbackAction = typeof action;
