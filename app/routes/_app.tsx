import type { Route } from "./+types/_app";

import { Outlet } from "react-router";

import { TooltipProvider } from "~/components/ui/tooltip";
import { useCustomHeader } from "~/lib/hooks/use-custom-header";
import { db } from "~/utils/db.server";
import { Footer } from "~/widgets/footer";
import { Header } from "~/widgets/header";

export const loader = async () => {
	const newsMinDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
	const [tags, newsCount] = await db.$transaction([
		db.tag.findMany({
			where: {
				products: {
					some: {
						active: true,
						beginDate: {
							gte: new Date(),
						},
					},
				},
			},
			orderBy: { name: "asc" },
		}),
		db.product.count({ where: { active: true, createdAt: { gt: newsMinDate } } }),
	]);

	return { tags, hasNews: newsCount > 0 };
};

export default function AppLayout({ loaderData }: Route.ComponentProps) {
	const isCustomHeader = useCustomHeader();

	return (
		<TooltipProvider>
			<div className="m-auto flex min-h-screen flex-col items-stretch pb-24">
				{!isCustomHeader ? <Header /> : null}
				<main className="reative flex-1">
					<Outlet />
				</main>
			</div>
			<Footer tags={loaderData.tags} hasNews={loaderData.hasNews} />
		</TooltipProvider>
	);
}
