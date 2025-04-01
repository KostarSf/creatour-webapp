import { Form, Link } from "react-router";
import { cn } from "~/lib/utils";
import { useOptionalUser } from "~/utils/user";

export function Header({ className }: { className?: string }) {
	const user = useOptionalUser();
	return (
		<header className={cn("pt-4 md:pt-6", className)}>
			<div className="z-10 mx-auto mb-6 flex w-full max-w-6xl items-baseline justify-between px-5 md:mb-12 md:px-10">
				<Link
					to="/"
					className="font-bold font-serif text-xl tracking-wider transition-colors hover:text-blue-500"
				>
					Креатур
				</Link>
				{user && (
					<Link to="/user" className="block hover:underline">
						ID {user.id.split("-")[0].toUpperCase()}
					</Link>
				)}
				<div className="flex gap-2">
					{user ? (
						<>
							<Form method="POST" action="/logout">
								<button type="submit" className="hover:underline">
									Выход
								</button>
							</Form>
						</>
					) : (
						<Link to="/login" className="hover:underline">
							Вход
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
