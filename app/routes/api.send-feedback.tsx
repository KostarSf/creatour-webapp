import { data } from "react-router";
import type { Route } from "./+types/api.send-feedback";

export const action = async ({ request }: Route.ActionArgs) => {
	const formData = await request.formData();
	console.log("Новый фидбек:", Object.fromEntries(formData));

	const success = true;
	return data({ success: success }, { status: success ? 200 : 400 });
};

export type SendFeedbackAction = typeof action;
