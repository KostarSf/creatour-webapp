import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import CatalogLayout from "~/components/CatalogLayout";
import PlaceItem from "~/components/PlaceItem";
import { db } from "~/utils/db.server";

export async function loader({ params }: LoaderArgs) {
  const places = await db.place.findMany();
  return json({ places: places });
}

export default function AllPlaces() {
  const data = useLoaderData<typeof loader>();

  return (
    <CatalogLayout>
      {data.places.map((p) => (
        <PlaceItem
          key={p.id}
          id={p.id}
          name={p.name}
          short={p.short}
          rating={p.rating}
          image={p.image}
        />
      ))}
    </CatalogLayout>
  );
}
