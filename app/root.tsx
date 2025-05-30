import type { LoaderFunctionArgs } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "~/tailwind.css";
import { Toaster } from "./components/ui/sonner";
import { getCurrentUserFromRequst } from "./utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	return { user: await getCurrentUserFromRequst(request) };
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
				<Toaster />
			</body>
		</html>
	);
}
