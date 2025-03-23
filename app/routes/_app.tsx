import { Form, Link, Outlet } from "react-router";
import { useOptionalUser } from "~/utils/user";
import { Footer } from "~/widgets/footer";

export default function AppLayout() {
	const user = useOptionalUser();

	return (
		<>
			<div className="m-auto flex min-h-screen flex-col items-stretch px-6 pt-3 pb-24 md:px-16 md:pt-6 lg:px-32">
				<header className="mb-6 w-full md:mb-12">
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
							<Link
								to="/object-recognizer/index.html"
								reloadDocument
								className="hidden text-blue-500 hover:underline sm:block"
							>
								Распознать объект
							</Link>
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
					<div className="">
						<Link
							to="/object-recognizer/index.html"
							reloadDocument
							className="inline text-blue-500 hover:underline sm:hidden"
						>
							Распознать объект
						</Link>
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
