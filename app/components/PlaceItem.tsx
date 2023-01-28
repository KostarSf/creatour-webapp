import { Link } from "@remix-run/react";

export default function PlaceItem({
  id,
  name,
  short,
  rating,
  image,
}: {
  id: string;
  name: string;
  short: string;
  rating: number;
  image?: string;
}) {
  return (
    <Link to={`/place/${id}`} className="flex gap-2">
      <img
        src={`/images/${image}`}
        alt={image}
        className="block h-14 w-24 shrink-0 rounded object-cover md:h-28 md:w-48"
      />
      <div>
        <h2 className="text-2xl font-semibold leading-none hover:text-blue-600 md:mb-3">
          {name}
        </h2>
        <p className="md:mb-2">{short}</p>
        <p className="text-sm font-semibold">Рейтинг: {rating}</p>
      </div>
    </Link>
  );
}
