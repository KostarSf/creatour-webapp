import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export async function loader({ params }: LoaderArgs) {
  const place = await db.place.findUnique({
    where: { id: params.id },
  });
  if (!place) {
    throw new Response("Place not found", { status: 404 });
  }

  return json(place);
}

export default function PlacePage() {
  const place = useLoaderData<typeof loader>();

  return (
    <div className="px-4 pt-6 pb-2">
      <img
        className="h-32 w-96 rounded object-cover"
        src={`/images/${place.image}`}
        alt={place.image}
      />
      <h2 className="my-3 text-2xl font-semibold leading-none">{place.name}</h2>
      <p className="mb-2">{place.description}</p>
      <p className="text-sm font-semibold">
        {place.city}, {place.address}
      </p>
      <p className="text-sm font-semibold">Рейтинг: {place.rating}</p>

      <p className="mt-6 text-lg font-semibold">Комментарии:</p>
      <div>
        <p>Здесь пока пусто</p>
      </div>
    </div>
  );
}
