import { requireRoleSession, requireUserId } from "~/utils/session.server";
import type { Route } from "./+types/_admin_v2";

import { Outlet } from "react-router";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppHeader } from "~/widgets/admin/app-header";
import { AppSidebar } from "~/widgets/admin/app-sidebar";
import { GlobalPendingIndicator } from "~/widgets/global-pending-indicator";

export const loader = async ({ request }: Route.LoaderArgs) => {
	await requireRoleSession(request, "admin", "/");
	return null;
};

export default function AdminV2Layout() {
	return (
		<SidebarProvider
			style={
				{
					"--text-base": "1.25rem",
					"--text-sm": "1rem",
					"--text-xs": "0.875rem",
				} as React.CSSProperties
			}
		>
			<AppSidebar variant="floating" collapsible="icon" className="fade-in animate-in" />
			<SidebarInset className="fade-in animate-in overflow-hidden">
				<GlobalPendingIndicator />
				<AppHeader />
				<main className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
