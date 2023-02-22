import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { useActionData, useLoaderData } from "@remix-run/react";

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();

  const name = form.get("name");
  const creatorId = form.get("creatorId");

  if (typeof name !== "string" || typeof creatorId !== "string") {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: `Форма неверно отправлена.`,
    });
  }

  const fields = { name, creatorId };

  const sameName = await db.place.findFirst({
    where: { name },
  });
  if (sameName) {
    return badRequest({
      fieldErrors: null,
      fields,
      formError: `Место с названием ${name} уже существует`,
    });
  }

  const user = await db.user.findUnique({ where: { id: creatorId } });
  if (!user) {
    return badRequest({
      fieldErrors: null,
      fields,
      formError: `Пользователя с Id ${creatorId} не существует`,
    });
  }

  const place = await db.place.create({
    data: { name, creatorId },
  });
  if (place) {
    return redirect(`/admin/places/${place.id}`);
  } else {
    return badRequest({
      fieldErrors: null,
      fields,
      formError: `Что-то пошло не так`,
    });
  }
};

export const loader = async ({ request }: LoaderArgs) => {
  const placeowners = await db.user.findMany({ where: { role: "placeowner" } });
  return json({ placeowners });
};

export default function NewPlace() {
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();

  if (data.placeowners.length === 0) {
    return (
      <p>
        Сначала добавьте пользователей с ролью <b>placeowner</b>
      </p>
    );
  }

  return (
    <div>
      <h2 className="font-medium">Новое место</h2>
      <form method="post" className="mt-2">
        <label>
          <p>Название</p>
          <input
            type="text"
            name="name"
            className="border"
            defaultValue={actionData?.fields?.name}
            required
          />
        </label>
        <label>
          <p>Владелец</p>
          <select
            name="creatorId"
            className="border"
            defaultValue={actionData?.fields?.creatorId}
            required
          >
            {data.placeowners.map((po) => (
              <option value={po.id} key={po.id}>
                {po.username}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="mt-8 block bg-blue-600 px-4 py-2 text-white"
        >
          Создать
        </button>
        <div>
          {actionData?.formError ? <p>{actionData.formError}</p> : null}
        </div>
      </form>
    </div>
  );
}
