import { Link } from "react-router";
import { ProductTypeToLocalizedString } from "~/utils/dataTypes";

export default function ProjectItem({
	id,
	name,
	short,
	type,
	image,
	rating,
}: {
	id: string;
	name: string;
	short: string | null;
	type: string;
	image?: string | null;
	rating: number;
}) {
	return (
		<Link to={`/product/${id}`} className="flex gap-2">
			<img
				src={`/images/products/${image}`}
				alt={image || "image"}
				className="block h-14 w-24 shrink-0 rounded object-cover md:h-28 md:w-48"
			/>
			<div>
				<h2 className="font-semibold text-2xl leading-none hover:text-blue-600 md:mb-3">
					{name}
				</h2>
				<p className="md:mb-2">{short}</p>
				<div className="flex flex-col justify-between sm:flex-row sm:items-center">
					<div>
						<p className="font-semibold text-sm ">
							{ProductTypeToLocalizedString(type)}
						</p>
						<p className="text-sm">
							Рейтинг: {Number.isNaN(rating) ? "Оценок пока нет" : rating}
						</p>
					</div>
				</div>
			</div>
		</Link>
	);
}
