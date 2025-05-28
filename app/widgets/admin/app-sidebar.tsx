import {
	BinocularsIcon,
	ChartNoAxesCombinedIcon,
	ChevronUpIcon,
	LandPlotIcon,
	MapPinHouseIcon,
	MessageSquareQuoteIcon,
	TentIcon,
	User2Icon,
	Users2Icon,
} from "lucide-react";
import { Link, href, useFetcher, useLocation } from "react-router";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "~/components/ui/sidebar";
import { useUser } from "~/utils/user";

interface AdministerMenuItemProps {
	title: string;
	url: string;
	icon: React.ExoticComponent;
	action?: React.ReactNode;
}

const menu: AdministerMenuItemProps[] = [
	{
		title: "Клиенты",
		url: href("/admin-v2/clients"),
		icon: Users2Icon,
	},
	{
		title: "Владельцы ресурсов",
		url: href("/admin-v2/placeowners"),
		icon: MapPinHouseIcon,
	},
	{
		title: "Разработчики туров",
		url: href("/admin-v2/creators"),
		icon: BinocularsIcon,
	},
	{
		title: "Турпродукты",
		url: href("/admin-v2/products"),
		icon: TentIcon,
	},
	{
		title: "Объекты",
		url: href("/admin-v2/places"),
		icon: LandPlotIcon,
	},
	{
		title: "Пользователи",
		url: href("/admin-v2/users"),
		icon: Users2Icon,
	},
	{
		title: "Статистика",
		url: href("/admin-v2/statistics"),
		icon: ChartNoAxesCombinedIcon,
	},
];

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<LogoMenuItem />
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Администрирование</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{menu.map((item) => (
								<AdministerMenuItem key={item.title} {...item} />
							))}

							<AdministerMenuItem
								title="Обратная связь"
								url={href("/admin-v2/feedback")}
								icon={MessageSquareQuoteIcon}
								className="font-medium text-lg text-primary"
							/>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<ProfileMenuItem />
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}

function LogoMenuItem() {
	const { setOpenMobile } = useSidebar();

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				className="data-[slot=sidebar-menu-button]:!p-1.5"
				onClick={() => setOpenMobile(false)}
				asChild
			>
				<Link to={href("/")}>
					<span className="font-semibold font-serif text-2xl text-primary">Креатур</span>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

interface AdministerMenuItemProps {
	title: string;
	url: string;
	icon: React.ExoticComponent;
	action?: React.ReactNode;
	className?: string;
}

function AdministerMenuItem({ title, url, icon: Icon, action, className }: AdministerMenuItemProps) {
	const location = useLocation();
	const isActive = location.pathname.startsWith(url);

	const { setOpenMobile } = useSidebar();

	return (
		<SidebarMenuItem key={title}>
			<SidebarMenuButton
				tooltip={title}
				isActive={isActive}
				onClick={() => setOpenMobile(false)}
				className={className}
				asChild
			>
				<Link to={url} prefetch="intent">
					<Icon />
					<span>{title}</span>
				</Link>
			</SidebarMenuButton>
			{action}
		</SidebarMenuItem>
	);
}

function ProfileMenuItem() {
	const user = useUser();

	const fetcher = useFetcher();
	const { setOpenMobile } = useSidebar();

	const logoutHandle = () => {
		const formData = new FormData();
		fetcher.submit(formData, { method: "POST", action: href("/logout") });

		setOpenMobile(false);
	};

	return (
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger className="whitespace-nowrap" asChild>
					<SidebarMenuButton>
						<User2Icon /> {user.email}
						<ChevronUpIcon className="ml-auto" />
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent side="top" align="start" className="w-(--radix-popper-anchor-width)">
					<DropdownMenuItem className="cursor-pointer" onClick={() => setOpenMobile(false)} asChild>
						<Link to={href("/user")}>Профиль</Link>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={logoutHandle}>
						<span>Выход</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	);
}

export { AppSidebar };
