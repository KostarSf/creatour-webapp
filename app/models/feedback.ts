import type { Feedback } from "@prisma-app/client";

import { db } from "~/utils/db.server";

export async function createFeedback(feedback: Omit<Feedback, "id" | "createdAt">): Promise<Feedback> {
	const createdFeedback = await db.feedback.create({ data: feedback });
	return createdFeedback;
}
