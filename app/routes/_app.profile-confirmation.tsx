import type { Route } from "./+types/_app.profile-confirmation";

import { Link, replace } from "react-router";

import type { User } from "@prisma-app/client";
import { db } from "~/utils/db.server";
import { logout, requireUserId } from "~/utils/session.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
	const searchParams = new URL(request.url).searchParams;
	const queryUserId = searchParams.get("id");
	const queryCode = searchParams.get("code");

	if (queryUserId && queryCode) {
		const success = await tryToConfirmUser(queryUserId, queryCode);
		if (!success) {
			throw new Response("Невалидная ссылка подтверждения", { status: 400 });
		}
		return { success: true };
	}

	const userId = await requireUserId(request, "/");

	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user) {
		throw logout(request);
	}

	if (user.activatedAt || !user.activateCode) {
		throw replace("/");
	}

	return { success: undefined };
};

async function tryToConfirmUser(userId: User["id"], code: string) {
	const user = await db.user.findUnique({ where: { id: userId } });
	if (!user) {
		return false;
	}

	if (!user.activateCode || !!user.activatedAt) {
		return true;
	}

	if (user.activateCode !== code) {
		return false;
	}

	await db.user.update({ where: { id: userId }, data: { activatedAt: new Date() } });
	return true;
}

export default function ProfileConfirmationPage({ loaderData }: Route.ComponentProps) {
	return (
		<div>
			{loaderData.success ? (
				<div>
					<p>Аккаунт подтвержден</p>
					<Link to="/">К турпродуктам</Link>
				</div>
			) : (
				<div>
					<input type="text" placeholder="Код подтверждения" />
					<button type="submit">Подтвердить</button>
				</div>
			)}
		</div>
	);
}
