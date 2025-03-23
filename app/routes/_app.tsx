import { Form, Link, Outlet } from "react-router";
import { useOptionalUser } from "~/utils/user";
import { Footer } from "~/widgets/footer";

export default function AppLayout() {
	const user = useOptionalUser();

	return (
		<>
			<div className="m-auto flex min-h-screen flex-col items-stretch pt-3 pb-24 md:pt-6">
				<header className="z-10 mx-auto mb-6 w-full max-w-6xl px-5 md:mb-12 md:px-10">
					<div className="flex items-baseline justify-between">
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
				<main className="reative flex-1">
					<Outlet />
				</main>
			</div>
			<Footer />
		</>
	);
}
