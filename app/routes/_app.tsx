import { Outlet } from "react-router";
import { useCustomHeader } from "~/lib/hooks/use-custom-header";
import { Footer } from "~/widgets/footer";
import { Header } from "~/widgets/header";

export default function AppLayout() {
	const isCustomHeader = useCustomHeader();

	return (
		<>
			<div className="m-auto flex min-h-screen flex-col items-stretch pb-24">
				{!isCustomHeader ? <Header /> : null}
				<main className="reative flex-1">
					<Outlet />
				</main>
			</div>
			<Footer />
		</>
	);
}
