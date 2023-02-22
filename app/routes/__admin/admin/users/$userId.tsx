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
  const user = await db.user.findUnique({
    where: { id: params.userId },
  });
  if (!user) {
    throw new Response("Нельзя удалить несуществующего пользователя", {
      status: 404,
    });
  }
  await db.user.delete({ where: { id: params.userId } });
  return redirect("/admin/users");
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await db.user.findUnique({
    where: { id: params.userId },
    include: {
      createdPlaces: { select: { id: true, name: true } },
      createdProducts: { select: { id: true, name: true } },
    },
  });
  if (!user) {
    throw new Response("Пользователь не найден", { status: 404 });
  }
  return json({ user });
};

export default function UserRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex gap-4">
      <div>
        <div className="mb-2 flex gap-2">
          <h2 className="font-medium">Пользователь - </h2>
          <Link to={"edit"} className="text-blue-600 hover:underline">
            Редактировать
          </Link>
          <Form
            method="post"
            onSubmit={(e) => {
              if (!confirm("Удалить пользователя?")) {
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
            Имя пользователя: <br /> <b>{data.user.username}</b>
          </p>
          <p>
            Электронная почта: <br /> <b>{data.user.email}</b>
          </p>
          <p>
            Тип учетной записи: <br /> <b>{data.user.role}</b>
          </p>
          <hr />
          <p>
            Город: <br /> <b>{data.user.city}</b>
          </p>
          <p>
            Телефон: <br /> <b>{data.user.phone}</b>
          </p>
          {data.user.role === "creator" || data.user.role === "placeowner" ? (
            <>
              <p>
                Юр. наименование: <br /> <b>{data.user.legalName}</b>
              </p>
              <p>
                ИНН: <br /> <b>{data.user.inn}</b>
              </p>

              <hr />

              {data.user.role === "placeowner" ? (
                <p>
                  Владелец объектов: <br />
                  {data.user.createdPlaces.map((place) => (
                    <Link
                      to={`/admin/places/${place.id}`}
                      prefetch="intent"
                      key={place.id}
                      className="mr-2 text-blue-600 hover:underline"
                    >
                      {place.name}
                    </Link>
                  ))}
                </p>
              ) : null}
              {data.user.role === "creator" ? (
                <p>
                  Разработчик турпродуктов: <br />
                  {data.user.createdProducts.map((product) => (
                    <Link
                      to={`/admin/products/${product.id}`}
                      prefetch="intent"
                      key={product.id}
                      className="mr-2 text-blue-600 hover:underline"
                    >
                      {product.name}
                    </Link>
                  ))}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
