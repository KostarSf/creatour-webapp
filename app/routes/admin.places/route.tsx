import type { LoaderFunctionArgs } from "react-router";
import { Link, NavLink, Outlet, useLoaderData } from "react-router";
import { db } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const places = await db.place.findMany();
	return { places };
};

export default function PlacesList() {
	const data = useLoaderData<typeof loader>();

	let placesList = <></>;

	if (data.places.length === 0) {
		placesList = <p className="my-2">Мест пока нет</p>;
	} else {
		placesList = (
			<div className="w-[25vw]">
				{data.places.map((place) => (
					<NavLink
						to={place.id}
						prefetch="intent"
						key={place.id}
						className="my-2 block"
						style={({ isActive }) => (isActive ? { background: "#eee" } : undefined)}
					>
						<p>
							<b>{place.name}</b>
						</p>
						<p>{place.short}</p>
					</NavLink>
				))}
			</div>
		);
	}

	return (
		<div className="flex gap-8">
			<div className="shrink-0">
				<Link to="new" className="text-blue-600 hover:underline">
					+ Добавить место
				</Link>
				{placesList}
			</div>
			<div>
				<Outlet />
			</div>
		</div>
	);
}
