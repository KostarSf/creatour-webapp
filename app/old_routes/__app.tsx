import { Outlet } from "react-router";
import AppLayout from "~/components/old/AppLayout";

export default function AppLayoutRoot() {
	return (
		<AppLayout>
			<Outlet />
		</AppLayout>
	);
}
