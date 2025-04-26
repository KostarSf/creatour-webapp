import { Link } from "react-router";
import { Fragment } from "react/jsx-runtime";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useBreadcrumb } from "~/hooks/use-breadcrumb";

export function AppHeader() {
	const breadcrumbItems = useBreadcrumb();

	return (
		<header className="flex h-14 shrink-0 items-center gap-2">
			<div className="flex flex-1 items-center gap-2 px-3">
				<SidebarTrigger />
				{breadcrumbItems?.length ? (
					<>
						<Separator orientation="vertical" className="mr-2 h-4!" />
						<Breadcrumb>
							<BreadcrumbList>
								{breadcrumbItems.map((item, index) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
									<Fragment key={index}>
										{index > 0 ? <BreadcrumbSeparator /> : null}
										<BreadcrumbItem>
											{item.href ? (
												<BreadcrumbLink asChild>
													<Link to={item.href} prefetch="intent">
														{item.label}
													</Link>
												</BreadcrumbLink>
											) : (
												<BreadcrumbPage>{item.label}</BreadcrumbPage>
											)}
										</BreadcrumbItem>
									</Fragment>
								))}
							</BreadcrumbList>
						</Breadcrumb>
					</>
				) : null}
			</div>
		</header>
	);
}
