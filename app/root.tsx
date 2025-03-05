import type { LoaderFunctionArgs } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "~/tailwind.css";
import { getUser } from "./utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	return { user: await getUser(request) };
};

export default function App() {
	return (
		<html lang="ru">
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
			</body>
		</html>
	);
}
