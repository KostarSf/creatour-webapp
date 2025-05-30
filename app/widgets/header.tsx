import { BinocularsIcon, LogOutIcon, MapPinHouseIcon, ShieldIcon, UserIcon } from "lucide-react";
import { Form, Link, href } from "react-router";
import LayoutWrapper from "~/components/LayoutWrapper";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button, buttonVariants } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { USER_ROLES } from "~/lib/user-roles";
import { cn } from "~/lib/utils";
import { useOptionalUser } from "~/utils/user";

export function Header({ className }: { className?: string }) {
	const user = useOptionalUser();

	return (
		<header className={cn("pt-4 md:pt-6", className)}>
			<LayoutWrapper className="z-10 mb-6 flex max-w-[100rem] items-baseline justify-between px-5 md:mb-12">
				<Link
					to="/"
					className="font-bold font-serif text-2xl tracking-wider transition-colors hover:text-blue-500 md:text-3xl"
				>
					Креатур
				</Link>
				{user ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="pl-1 ring-border">
								<Avatar>
									<AvatarImage src={user.avatar ?? undefined} />
									<AvatarFallback className="border text-foreground">
										{user.username.substring(0, 1)}
									</AvatarFallback>
								</Avatar>
								<span className="flex flex-col items-start leading-none">
									<span className="font-medium">{user.email}</span>
									<span className="space-x-2 text-xs leading-none">
										<span>{user.username}</span>
										{user.legalName ? <span>{`(${user.legalName})`}</span> : null}
									</span>
								</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							<DropdownMenuGroup>
								<DropdownMenuItem className="cursor-pointer" asChild>
									<Link to={href("/user")}>
										<UserIcon />
										<span>Кабинет пользователя</span>
									</Link>
								</DropdownMenuItem>
								{(user.role === USER_ROLES.creator.key ||
									user.role === USER_ROLES.admin.key) && (
									<DropdownMenuItem className="cursor-pointer" asChild>
										<Link to={href("/creator")}>
											<BinocularsIcon />
											<span>Кабинет создателя турпродуктов</span>
										</Link>
									</DropdownMenuItem>
								)}
								{(user.role === USER_ROLES.placeowner.key ||
									user.role === USER_ROLES.admin.key) && (
									<DropdownMenuItem className="cursor-pointer" asChild>
										<Link to={href("/placeowner")}>
											<MapPinHouseIcon />
											<span>Кабинет владельца ресурсов</span>
										</Link>
									</DropdownMenuItem>
								)}
								{user.role === USER_ROLES.admin.key && (
									<DropdownMenuItem className="cursor-pointer" asChild>
										<Link to={href("/admin-v2")}>
											<ShieldIcon />
											<span>Панель администрирования</span>
										</Link>
									</DropdownMenuItem>
								)}
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<Form method="POST" action="/logout" className="grid w-full">
									<DropdownMenuItem asChild>
										<button type="submit">
											<LogOutIcon />
											Выход
										</button>
									</DropdownMenuItem>
								</Form>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<Link
						to={href("/login")}
						className={cn(buttonVariants({ variant: "ghost" }), "md:text-lg")}
					>
						Войти
					</Link>
				)}
			</LayoutWrapper>
		</header>
	);
}
