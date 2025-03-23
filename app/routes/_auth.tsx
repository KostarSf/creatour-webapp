import { Link, NavLink, Outlet, useSearchParams } from "react-router";

export default function AuthLayout() {
	const [searchParams] = useSearchParams();

	return (
		<div className="flex min-h-screen w-screen items-stretch">
			<div className="grow md:shrink-0 md:grow-0">
				<div className="flex flex-col items-stretch bg-white px-6 py-8 sm:items-center md:items-start md:px-12 md:py-12 lg:px-24 lg:py-16">
					<Link
						to={"/"}
						className="mb-4 text-center font-semibold font-serif text-4xl sm:text-left md:hidden"
					>
						Креатур
					</Link>
					<div className="space-x-10 text-center sm:text-left">
						<NavLink
							to={{
								pathname: "/login",
								search: searchParams.toString(),
							}}
							className={({ isActive, isPending }) =>
								`${
									isActive || isPending ? "border-blue-500 border-b-2" : "text-gray-500"
								} px-1 py-0.5 transition-colors hover:text-black`
							}
						>
							Вход
						</NavLink>
						<NavLink
							to={{
								pathname: "/register",
								search: searchParams.toString(),
							}}
							className={({ isActive, isPending }) =>
								`${
									isActive || isPending ? "border-blue-500 border-b-2" : "text-gray-500"
								} px-1 py-0.5 transition-colors hover:text-black`
							}
						>
							Регистрация
						</NavLink>
					</div>
					<Outlet />
				</div>
			</div>
			<div className="hidden flex-1 bg-[url(/images/auth-bg.webp)] bg-center bg-cover md:block">
				<div className="text-right md:px-12 md:py-12 lg:px-24 lg:py-16">
					<Link
						to={"/"}
						className="font-bold font-serif text-5xl text-white transition-colors hover:text-blue-500 lg:text-6xl"
					>
						Креатур
					</Link>
					<p className="mt-16 text-3xl/normal text-white tracking-widest lg:text-4xl/normal">
						Отдыхай <br />
						креативно <br />
						вместе с <br />
						нами
					</p>
				</div>
			</div>
		</div>
	);
}
