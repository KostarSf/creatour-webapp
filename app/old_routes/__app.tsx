import { Outlet } from "@remix-run/react";
import AppLayout from "~/components/old/AppLayout";

export default function AppLayoutRoot() {
	return (
		<AppLayout>
			<Outlet />
		</AppLayout>
	);
}
