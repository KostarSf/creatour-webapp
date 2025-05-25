import type { Product, User } from "@prisma-app/client";

import type { UserRole } from "~/lib/user-roles";
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

	if (!user) {
		return null;
	}

	const { activateCode, activatedAt, recoverCode, ...filteredUser } = user;

	return {
		...filteredUser,
		activated: !!activatedAt,
		activateEmailSent: !!activateCode,
	} as CurrentUser;
}

export interface CurrentUser
	extends Omit<User, "passwordHash" | "activateCode" | "activatedAt" | "recoverCode"> {
	activeProducts: Pick<Product, "id">[];
	favoriteProducts: Pick<Product, "id">[];
	role: UserRole;
	activated: boolean;
	activateEmailSent: boolean;
}
