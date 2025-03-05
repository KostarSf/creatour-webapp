import { Link } from "react-router";

export default function PlaceItem({
	id,
	name,
	short,
	rating,
	image,
}: {
	id: string;
	name: string;
	short: string | null;
	rating: string;
	image?: string | null;
}) {
	return (
		<Link to={`/place/${id}`} className="flex gap-2">
			<img
				src={`/images/places/${image}`}
				alt={image || "place"}
				className="block h-14 w-24 shrink-0 rounded object-cover md:h-28 md:w-48"
			/>
			<div>
				<h2 className="font-semibold text-2xl leading-none hover:text-blue-600 md:mb-3">
					{name}
				</h2>
				<p className="md:mb-2">{short}</p>
				<p className="font-semibold text-sm">Рейтинг: {rating}</p>
			</div>
		</Link>
	);
}
