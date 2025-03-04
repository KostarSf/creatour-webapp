import { NavLink, Outlet } from "@remix-run/react";
import CatalogLayout from "~/components/CatalogLayout";
import SideBlockContent from "~/components/SideBlockContent";
import SideButtonLink from "~/components/SideButtonLink";

export default function ProductsPage() {
	return (
		<CatalogLayout>
			<>
				<div className="flex flex-col sm:flex-row">
					<p className="mr-2">Категории: </p>
					<nav className="flex flex-wrap gap-x-2 ">
						<CategoryLink>Все вместе</CategoryLink>
						<CategoryLink category="excursions">Экскурсии</CategoryLink>
						<CategoryLink category="tours">Туры</CategoryLink>
						<CategoryLink category="quests">Мероприятия</CategoryLink>
						<CategoryLink category="events">События</CategoryLink>
					</nav>
				</div>
				<Outlet />
			</>
		</CatalogLayout>
	);
}

function ProjectsSideBlock() {
	return (
		<SideBlockContent
			firstParagraph={
				<>Здесь вы найдете готовые проекты и решения от наших исполнителей.</>
			}
			secondParagraph={
				<>
					Если вас заинтересовало какое-либо предложение, смело{" "}
					<span className="font-semibold">откликайтесь</span>, чтобы узнать
					подробности.
				</>
			}
			actionText={
				<>
					Вы <span className="font-semibold">исполнитель</span> с готовым
					решением и хотите найти заказчика?
				</>
			}
			actionButton={
				<SideButtonLink text="Разместите свой проект" url="/projects/new" />
			}
		/>
	);
}

function CategoryLink({
	children,
	category,
}: {
	children?: React.ReactNode;
	category?: string;
}) {
	return (
		<NavLink
			to={`.${category ? `/${category}` : ""}`}
			className="text-slate-500 hover:text-blue-600 hover:underline"
			style={({ isActive }) =>
				isActive
					? { fontWeight: 500, textDecoration: "underline", color: "black" }
					: undefined
			}
			end
		>
			{children}
		</NavLink>
	);
}
