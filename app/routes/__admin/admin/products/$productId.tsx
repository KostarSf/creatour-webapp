import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const action = async ({ params, request }: ActionArgs) => {
  const form = await request.formData();
  const intent = form.get("intent");

  const product = await db.product.findUnique({
    where: { id: params.productId },
  });
  if (!product) {
    throw new Response("Данный турпродукт не существует", {
      status: 404,
    });
  }

  if (intent === "delete") {
    await db.product.delete({ where: { id: params.productId } });
    return redirect("/admin/products");
  }

  if (intent === "addplace" || intent === "removeplace") {
    if (intent === "addplace") {
      const placeId = form.get("place");
      if (typeof placeId !== "string") {
        throw new Response("Ошибка отправки формы", {
          status: 400,
        });
      }
      const place = await db.place.findUnique({
        where: { id: placeId },
      });
      if (!place) {
        throw new Response(`Места с Id ${placeId} не существует`, {
          status: 404,
        });
      }
      const routePoints = await db.routePoint.findMany({
        where: { productId: params.productId },
      });
      await db.product.update({
        where: { id: params.productId },
        data: {
          route: {
            create: {
              order: routePoints.length + 1,
              date: new Date().toISOString(),
              placeId,
            },
          },
        },
      });
      return new Response("", { status: 200 });
    } else if (intent === "removeplace") {
      const pointId = form.get("point");
      if (typeof pointId !== "string") {
        throw new Response("Ошибка отправки формы", {
          status: 400,
        });
      }
      const point = await db.routePoint.findUnique({
        where: { id: pointId },
      });
      if (!point) {
        throw new Response(`Точки маршрута с Id ${pointId} не существует`, {
          status: 404,
        });
      }
      await db.routePoint.delete({ where: { id: pointId } });
      return new Response("", { status: 200 });
    }
  } else {
    throw new Response(`Действие ${form.get("intent")} не поддерживается`, {
      status: 400,
    });
  }
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const product = await db.product.findUnique({
    where: { id: params.productId },
    include: {
      tags: true,
      route: { include: { place: { select: { name: true } } } },
    },
  });
  if (!product) {
    throw new Response("Турпродукт не найден", { status: 404 });
  }
  const creator = await db.user.findUnique({
    where: { id: product.creatorId },
  });
  const places = await db.place.findMany({
    select: { id: true, name: true },
  });
  return json({
    product,
    creator: creator ? { username: creator.username, id: creator.id } : null,
    places,
  });
};

export default function ProductRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex gap-4">
      <div>
        <div className="mb-2 flex gap-2">
          <h2 className="font-medium">Турпродукт - </h2>
          <Link to={"edit"} className="text-blue-600 hover:underline">
            Редактировать
          </Link>
          <Form
            method="post"
            onSubmit={(e) => {
              if (!confirm("Удалить турпродукт?")) {
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
            Название: <br /> <b>{data.product.name}</b>
          </p>
          {data.creator ? (
            <p>
              Создатель: <br />{" "}
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
            Краткое описание: <br /> <b>{data.product.short}</b>
          </p>
          <p>
            Детальное описание: <br /> <b>{data.product.description}</b>
          </p>

          <hr />

          <p>
            Тип турпродукта: <br /> <b>{data.product.type}</b>
          </p>
          <p>
            Цена: <br />{" "}
            <b>
              {data.product.price > 0 ? `${data.product.price} ₽` : "бесплатно"}
            </b>
          </p>
          <p>
            Турпродукт активен: <br />{" "}
            <b>{data.product.active ? "Да" : "Нет"}</b>
          </p>
          <p>
            Теги: <br />
            {data.product.tags.map((tag) => (
              <Link
                to={`/admin/tags/${tag.id}`}
                prefetch="intent"
                key={tag.id}
                className="pr-2 text-blue-600 hover:underline"
              >{`#${tag.name}`}</Link>
            ))}
          </p>

          <hr />

          <p>
            Город: <br /> <b>{data.product.city}</b>
          </p>
          <p>
            Адрес: <br /> <b>{data.product.address}</b>
          </p>
          <p>
            Координаты: <br /> <b>{data.product.coordinates}</b>
          </p>
          <p>
            Дата проведения: <br />{" "}
            <b>
              {data.product.beginDate
                ? new Date(data.product.beginDate).toLocaleString()
                : null}
            </b>
          </p>
          <p>
            Дата окончания: <br />{" "}
            <b>
              {data.product.endDate
                ? new Date(data.product.endDate).toLocaleString()
                : null}
            </b>
          </p>
          <p>
            Ассистент: <br /> <b>{data.product.assistant}</b>
          </p>

          <hr />

          <p>Изображение:</p>
          {data.product.image ? (
            <img
              src={`/images/products/${data.product.image}`}
              alt="Изображение"
              className="w-64"
            />
          ) : null}
        </div>
      </div>
      <div>
        <h2 className="mb-2 font-medium">Программа мероприятия</h2>
        {data.product.route.length === 0 ? (
          <p>Не задана</p>
        ) : (
          <div>
            {data.product.route.map((point) => (
              <p key={point.placeId} className="flex">
                <Form
                  method="post"
                  className="flex gap-2"
                  onSubmit={(e) => {
                    if (!confirm("Удалить точку маршрута?")) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Link
                    to={`/admin/places/${point.placeId}`}
                    className="text-blue-600 hover:underline"
                  >
                    <p>{point.place.name}</p>
                  </Link>
                  <input type="hidden" name="point" value={point.id} />
                  <button
                    type="submit"
                    name="intent"
                    value="removeplace"
                    className="text-red-600 hover:underline"
                  >
                    Удалить
                  </button>
                </Form>
              </p>
            ))}
          </div>
        )}
        <hr className="my-2" />
        <Form method="post">
          <select name="place" className="border">
            {data.places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            name="intent"
            value="addplace"
            className="px-2 text-blue-600 hover:underline"
          >
            Добавить
          </button>
        </Form>
      </div>
    </div>
  );
}
