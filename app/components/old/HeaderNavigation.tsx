import NavigationLink from "./NavigationLink";
import NavigationSubMenu from "./NavigationSubMenu";

export default function HeaderNavigation({
	onClick,
}: {
	onClick?: VoidFunction;
}) {
	return (
		<nav onClick={onClick} className="md:flex">
			<NavigationSubMenu subtitle="Турпродукты" linkTo="/products">
				<NavigationLink url="/products/excursions" title="Экскурсии" />
				<NavigationLink url="/products/tours" title="Туры" />
				<NavigationLink url="/products/quests" title="Мероприятия" />
				<NavigationLink url="/products/events" title="События" />
			</NavigationSubMenu>
			<NavigationLink url="/places" title="Места" />
			<NavigationLink url="/user" title="Личный кабинет" />
		</nav>
	);
}
