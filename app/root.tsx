import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "@remix-run/react";
import tailwindcss from "~/tailwind.css";
import { getUser } from "./utils/session.server";

export const links: LinksFunction = () => [
	{ rel: "stylesheet", href: tailwindcss },
];

export const loader = async ({ request }: LoaderArgs) => {
	return json({ user: await getUser(request) });
};

export default function App() {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				<Outlet />
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
