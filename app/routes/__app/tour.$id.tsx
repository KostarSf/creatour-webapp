import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import SideButtonLink from "~/components/SideButtonLink";
import type { PlacePoint } from "~/utils/dataTypes";
import { db } from "~/utils/db.server";

export async function loader({ params }: LoaderArgs) {
  const tour = await db.tour.findUnique({
    where: { id: params.id },
  });
  if (!tour) {
    throw new Response("Tour not found", { status: 404 });
  }

  const routePoints = await db.routePoint.findMany({
    where: { parentId: params.id },
    orderBy: { order: "asc" },
  });

  let route: PlacePoint[] = [];
  for (let i = 0; i < routePoints.length; i++) {
    const p = routePoints[i];
    const place = await db.place.findFirstOrThrow({
      select: { id: true, name: true, address: true },
      where: { id: p.pointId },
    });
    route = [...route, { ...place, order: p.order }];
  }

  return json({ tour: tour, route: route });
}

export default function TourPage() {
  const data = useLoaderData<typeof loader>();
  const tour = data.tour;
  const route = data.route;

  return (
    <div className="px-4 pt-6 pb-2">
      <img
        className="h-32 w-96 rounded object-cover"
        src={`/images/${tour.image}`}
        alt={tour.image}
      />
      <h2 className="my-3 text-2xl font-semibold leading-none">{tour.name}</h2>
      <p className="mb-2">{tour.description}</p>
      <p className="text-sm font-semibold">
        {tour.city}, {tour.address}
      </p>
      <p className="text-sm font-semibold">Рейтинг: {tour.rating}</p>
      <div className="my-3">
        <SideButtonLink
          text={`Начать тур` + (tour.price > 0 ? ` за ${tour.price} ₽` : "")}
          url="#"
        />
      </div>

      <p className="mt-6 text-lg font-semibold">Маршрут:</p>
      <div className="flex flex-col gap-4">
        {route.map((r) => (
          <Link
            to={`/place/${r.id}`}
            key={r.id}
            className="border-l-4 border-blue-500 pl-2"
          >
            <p className="font-semibold hover:text-blue-600">{r.name}</p>
            <p className="text-sm">{r.address}</p>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-lg font-semibold">Комментарии:</p>
      <div>
        <p>Здесь пока пусто</p>
      </div>
    </div>
  );
}
