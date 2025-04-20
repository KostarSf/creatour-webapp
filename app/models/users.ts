import type { Product, User } from "@prisma/client";
import { db } from "~/utils/db.server";

export async function getCurrentUser(userId: string): Promise<CurrentUser | null> {
	const user = await db.user.findUnique({
		where: { id: userId },
		include: {
			activeProducts: { select: { id: true } },
			favoriteProducts: { select: { id: true } },
		},
		omit: { passwordHash: true },
	});

	return user as CurrentUser | null;
}

export type CurrentUser = Omit<User, "passwordHash"> & {
		activeProducts: Pick<Product, "id">[];
		favoriteProducts: Pick<Product, "id">[];
		role: "user" | "creator" | "placeowner" | "admin";
	};
