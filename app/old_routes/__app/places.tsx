import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import CatalogLayout from "~/components/old/CatalogLayout";
import PlaceItem from "~/components/old/PlaceItem";
import { db } from "~/utils/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
	const places = await db.place.findMany({ include: { rating: true } });
	return { places: places };
}

export default function AllPlaces() {
	const data = useLoaderData<typeof loader>();

	return (
		<CatalogLayout>
			{data.places.map((p) => {
				const ratingsCount = p.rating.length;
				const ratingsSum = p.rating
					.map((r) => r.value)
					.reduce((prev, cur) => prev + cur, 0);
				const totalRatimg = Math.round((ratingsSum / ratingsCount) * 100) / 100;

				return (
					<PlaceItem
						key={p.id}
						id={p.id}
						name={p.name}
						short={p.short}
						rating={
							Number.isNaN(totalRatimg)
								? "Оценок пока нет"
								: String(totalRatimg)
						}
						image={p.image}
					/>
				);
			})}
		</CatalogLayout>
	);
}
