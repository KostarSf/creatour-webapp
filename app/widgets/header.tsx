import { Form, Link, href } from "react-router";
import LayoutWrapper from "~/components/LayoutWrapper";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { useOptionalUser } from "~/utils/user";

export function Header({ className }: { className?: string }) {
	const user = useOptionalUser();

	return (
		<header className={cn("pt-4 md:pt-6", className)}>
			<LayoutWrapper className="z-10 mb-6 flex items-baseline justify-between px-5 md:mb-12">
				<Link
					to="/"
					className="font-bold font-serif text-xl tracking-wider transition-colors hover:text-blue-500"
				>
					Креатур
				</Link>
				{user ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="pl-1 ring-border hover:bg-transparent hover:ring"
							>
								<Avatar>
									<AvatarImage src={user.avatar ?? undefined} />
									<AvatarFallback>{user.username.substring(0, 1)}</AvatarFallback>
								</Avatar>
								<span className="flex flex-col items-start leading-none">
									<span className="font-semibold">{user.email}</span>
									<span>{user.username}</span>
								</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							<DropdownMenuGroup>
								<DropdownMenuItem className="cursor-pointer" asChild>
									<Link to={href("/user")}>Кабинет пользователя</Link>
								</DropdownMenuItem>
								{user.role === "creator" && (
									<DropdownMenuItem className="cursor-pointer" asChild>
										<Link to={href("/creator")}>Кабинет создателя турпродуктов</Link>
									</DropdownMenuItem>
								)}
								{user.role === "placeowner" && (
									<DropdownMenuItem className="cursor-pointer" asChild>
										<Link to={href("/placeowner")}>Кабинет владельца ресурсов</Link>
									</DropdownMenuItem>
								)}
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<Form method="POST" action="/logout" className="grid w-full">
									<DropdownMenuItem asChild>
										<button type="submit">Выход</button>
									</DropdownMenuItem>
								</Form>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				) : null}
			</LayoutWrapper>
		</header>
	);
}
