import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { createCookieSessionStorage, href, redirect } from "react-router";

import type { User } from "@prisma-app/client";
import z from "zod";
import { type CurrentUser, getCurrentUser } from "~/models/users";
import { db } from "./db.server";

type LoginForm = {
	email: string;
	password: string;
};

type RegisterForm = LoginForm & {
	username: string;
	role: string;
	activateCode?: string;
};

export async function register({
		email,
		password,
		username,
		role,
		activateCode,
	}: RegisterForm): Promise<UserSessionPayload> {
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await db.user.create({
			data: { username, passwordHash, email, role, activateCode },
		});
		return { id: user.id, role };
	}

const mailerSchema = z.interface({
	MAILER_HOST: z.string().min(1),
	MAILER_PORT: z.coerce.number(),
	MAILER_USER: z.string().min(1),
	MAILER_PASSWORD: z.string().min(1),
	MAILER_FROM: z.string().min(1),
	MAILER_FROM_NAME: z.string().min(1),
});

const mailerConfig = mailerSchema.parse(process.env);

const transporter = nodemailer.createTransport({
	host: mailerConfig.MAILER_HOST,
	port: mailerConfig.MAILER_PORT,
	secure: true,
	auth: {
		user: mailerConfig.MAILER_USER,
		pass: mailerConfig.MAILER_PASSWORD,
	},
});

const siteDomain = process.env.SITE_DOMAIN ?? "localhost";

export async function sendActivateLink(userId: string, code: string, email: string) {
	const info = await transporter.sendMail({
		from: `"${mailerConfig.MAILER_FROM_NAME}" <${mailerConfig.MAILER_FROM}>`,
		to: email,
		subject: "Подтверждение регистрации на сайте Креатур",
		html: `<!DOCTYPE html>
		<html lang="ru">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Подтверждение регистрации на сайте Креатур</title>
		</head>
		<body>
			<h1>Подтверждение регистрации на сайте Креатур</h1>
			<p>
				Вы создали аккаунт на сайте <b>Креатур</b>. Для подтверждения регистрации перейдите по
				<a href="https://${siteDomain}${href("/profile-confirmation")}?id=${userId}&code=${code}" target="_blank" rel="noreferrer">
					ссылке
				</a>.
			</p>
		</body>
		</html>`,
	});

	console.log(info);
}

export async function sendRecoverLink(userId: string, code: string, email: string) {
	const info = await transporter.sendMail({
		from: `"${mailerConfig.MAILER_FROM_NAME}" <${mailerConfig.MAILER_FROM}>`,
		to: email,
		subject: "Восстановение пароля на сайте Креатур",
		html: `<!DOCTYPE html>
		<html lang="ru">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Восстановение пароля на сайте Креатур</title>
		</head>
		<body>
			<h1>Восстановение пароля на сайте Креатур</h1>
			<p>
				Вы начали процесс восстановления пароля на сайте <b>Креатур</b>. Для сброса пароля перейдите по
				<a href="https://${siteDomain}${href("/reset-password")}?id=${userId}&code=${code}" target="_blank" rel="noreferrer">
					ссылке
				</a>.
			</p>
		</body>
		</html>`,
	});

	console.log(info);
}

export async function login({ email, password }: LoginForm): Promise<UserSessionPayload | null> {
	const user = await db.user.findUnique({
		where: { email },
	});
	if (!user) return null;
	const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
	if (!isCorrectPassword) return null;
	return {
		id: user.id,
		role: user.role,
	};
}

export type UserSessionPayload = Pick<User, "id" | "role">;

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

export async function getUserSessionPayload(request: Request): Promise<UserSessionPayload | null> {
	const session = await getUserSession(request);
	const userId = session.get("userId");
	const userRole = session.get("userRole");
	if (!userId || typeof userId !== "string" || !userRole || typeof userRole !== "string") {
		return null;
	}
	return { id: userId, role: userRole };
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
	const userId = await getUserId(request);
	if (!userId || typeof userId !== "string") {
		const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
		throw redirect(`/login?${searchParams}`);
	}
	return userId;
}

export async function requireSession(request: Request, redirectTo: string = new URL(request.url).pathname) {
	const sessionPayload = await getUserSessionPayload(request);
	if (!sessionPayload) {
		const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
		throw redirect(`/login?${searchParams}`);
	}
	return sessionPayload;
}

export async function requireRoleSession(
		request: Request,
		role: string | string[],
		redirectTo: string = new URL(request.url).pathname,
	) {
		const sessionPayload = await getUserSessionPayload(request);
		if (
			!sessionPayload ||
			(typeof role === "string" ? sessionPayload.role !== role : role.includes(sessionPayload.role))
		) {
			const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
			throw redirect(`/login?${searchParams}`);
		}
		return sessionPayload;
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

export async function getCurrentUserFromRequst(request: Request): Promise<CurrentUser | null> {
	const userId = await getUserId(request);
	if (typeof userId !== "string") {
		return null;
	}

	try {
		const user = await getCurrentUser(userId);
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

export async function createUserSession(user: UserSessionPayload, remember: boolean, redirectTo: string) {
	const session = await storage.getSession();
	session.set("userId", user.id);
	session.set("userRole", user.role);
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
