import bcrypt from "bcryptjs";
import { createCookieSessionStorage, redirect } from "react-router";

import { db } from "./db.server";

type LoginForm = {
	email: string;
	password: string;
};

type RegisterForm = LoginForm & {
	username: string;
	role: string;
};

export async function register({
	email,
	password,
	username,
	role,
}: RegisterForm) {
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await db.user.create({
		data: { username, passwordHash, email, role },
	});
	return { id: user.id, username, email, role };
}

export async function login({ email, password }: LoginForm) {
	const user = await db.user.findUnique({
		where: { email },
	});
	if (!user) return null;
	const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
	if (!isCorrectPassword) return null;
	return {
		id: user.id,
		username: user.username,
		email: user.email,
		role: user.role,
	};
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
	throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
	cookie: {
		name: "RJ_session",
		// secure doesn't work on localhost for Safari
		// https://web.dev/when-to-use-local-https/
		secure: process.env.NODE_ENV === "production",
		secrets: [sessionSecret],
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30,
		httpOnly: true,
	},
});

export function getUserSession(request: Request) {
	return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
	const session = await getUserSession(request);
	const userId = session.get("userId");
	if (!userId || typeof userId !== "string") return null;
	return userId;
}

export async function requireUserId(
	request: Request,
	redirectTo: string = new URL(request.url).pathname,
) {
	const userId = await getUserId(request);
	if (!userId || typeof userId !== "string") {
		const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
		throw redirect(`/login?${searchParams}`);
	}
	return userId;
}

export async function getUser(request: Request) {
	const userId = await getUserId(request);
	if (typeof userId !== "string") {
		return null;
	}

	try {
		const user = await db.user.findUnique({
			where: { id: userId },
			select: { id: true, username: true, email: true, role: true },
		});
		return user;
	} catch {
		throw logout(request);
	}
}

export async function logout(request: Request) {
	const session = await getUserSession(request);
	return redirect("/", {
		headers: {
			"Set-Cookie": await storage.destroySession(session),
		},
	});
}

export async function createUserSession(
	userId: string,
	remember: boolean,
	redirectTo: string,
) {
	const session = await storage.getSession();
	session.set("userId", userId);
	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await storage.commitSession(session, {
				maxAge: remember
					? 60 * 60 * 24 * 7 // 7 days
					: undefined,
			}),
		},
	});
}
