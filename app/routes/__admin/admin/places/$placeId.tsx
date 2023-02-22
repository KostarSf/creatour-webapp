import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const action = async ({ params, request }: ActionArgs) => {
  const form = await request.formData();
  if (form.get("intent") !== "delete") {
    throw new Response(`Действие ${form.get("intent")} не поддерживается`, {
      status: 400,
    });
  }
  const place = await db.place.findUnique({
    where: { id: params.placeId },
  });
  if (!place) {
    throw new Response("Нельзя удалить несуществующее место", {
      status: 404,
    });
  }
  await db.place.delete({ where: { id: params.placeId } });
  return redirect("/admin/places");
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const place = await db.place.findUnique({
    where: { id: params.placeId },
    include: { tags: true },
  });
  if (!place) {
    throw new Response("Место не найдено", { status: 404 });
  }
  const creator = await db.user.findUnique({ where: { id: place.creatorId } });
  return json({
    place,
    creator: creator ? { username: creator.username, id: creator.id } : null,
  });
};

export default function PlaceRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex gap-4">
      <div>
        <div className="mb-2 flex gap-2">
          <h2 className="font-medium">Место - </h2>
          <Link to={"edit"} className="text-blue-600 hover:underline">
            Редактировать
          </Link>
          <Form
            method="post"
            onSubmit={(e) => {
              if (!confirm("Удалить место?")) {
                e.preventDefault();
              }
            }}
          >
            <button
              type="submit"
              name="intent"
              value="delete"
              className="text-red-600 hover:underline"
            >
              Удалить
            </button>
          </Form>
        </div>
        <div className="flex flex-col gap-2">
          <p>
            Название: <br /> <b>{data.place.name}</b>
          </p>
          {data.creator ? (
            <p>
              Владелец: <br />{" "}
              <Link
                to={`/admin/users/${data.creator.id}`}
                prefetch="intent"
                className="text-blue-600 hover:underline"
              >
                {data.creator.username}
              </Link>
            </p>
          ) : null}
          <p>
            Краткое описание: <br /> <b>{data.place.short}</b>
          </p>
          <p>
            Детальное описание: <br /> <b>{data.place.description}</b>
          </p>
          {/* картинка */}
          <hr />
          <p>
            Город: <br /> <b>{data.place.city}</b>
          </p>
          <p>
            Адрес: <br /> <b>{data.place.address}</b>
          </p>
          <p>
            Координаты: <br /> <b>{data.place.coordinates}</b>
          </p>
          <p>
            Теги: <br />
            {data.place.tags.map((tag) => (
              <Link
                to={`/admin/tags/${tag.id}`}
                prefetch="intent"
                key={tag.id}
                className="pr-2 text-blue-600 hover:underline"
              >{`#${tag.name}`}</Link>
            ))}
          </p>
          <hr />
          <p>Изображение:</p>
          {data.place.image ? (
            <img
              src={`/images/places/${data.place.image}`}
              alt="Изображение"
              className="w-64"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
