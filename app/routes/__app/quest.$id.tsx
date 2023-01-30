import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import SideButtonLink from "~/components/SideButtonLink";
import { PlacePoint } from "~/utils/dataTypes";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUser, requireUserId } from "~/utils/session.server";

function validateComment(comment: string) {
  if (comment.length < 4) {
    return `Комментарий слишком короткий`;
  }
}

export async function loader({ params, request }: LoaderArgs) {
  const quest = await db.quest.findUnique({
    where: { id: params.id },
  });
  if (!quest) {
    throw new Response("Quest not found", { status: 404 });
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

  const comments = await db.comment.findMany({
    where: {
      postId: quest.id,
    },
    include: { user: true },
  });

  const user = await getUser(request);

  return json({
    quest: quest,
    route: route,
    comments: comments,
    user: user,
    url: request.url,
  });
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);

  const form = await request.formData();
  const postId = form.get("postId");
  const text = form.get("text");
  if (typeof text !== "string" || typeof postId !== "string") {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: `Форма неверно отправлена.`,
    });
  }

  const fieldErrors = {
    text: validateComment(text),
  };
  const fields = { text, postId };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields, formError: null });
  }

  await db.comment.create({
    data: {
      text: text,
      userId: userId,
      postId: postId,
    },
  });

  return json({
    fields: {
      postId: postId,
      text: "",
    },
    fieldErrors: {
      text: null,
    },
  });
}

export default function QuestPage() {
  const data = useLoaderData<typeof loader>();
  const quest = data.quest;
  const route = data.route;
  const comments = data.comments;
  const user = data.user;

  const actionData = useActionData<typeof action>();

  return (
    <div className="px-4 pt-6 pb-2">
      <img
        className="h-32 w-96 rounded object-cover"
        src={`/images/${quest.image}`}
        alt={quest.image}
      />
      <h2 className="my-3 text-2xl font-semibold leading-none">{quest.name}</h2>
      <p className="mb-2">{quest.description}</p>
      <p className="text-sm font-semibold">
        {quest.city}, {quest.address}
      </p>
      <p className="text-sm font-semibold">Рейтинг: {quest.rating}</p>

      <div className="my-3">
        <SideButtonLink text={`Посетить за ${quest.price} ₽`} url="#" />
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
        {comments.length === 0 ? (
          <p>Здесь пока пусто</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="mb-4">
              <p className="text-lg font-semibold">{c.user.username}</p>
              <p>{c.text}</p>
              <div className="flex items-baseline gap-4">
                <p className="text-sm text-slate-500">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
                {user && c.userId === user.id ? (
                  <Form action="/remove-comment" method="post">
                    <input type="hidden" name="commentId" value={c.id} />
                    <input type="hidden" name="redirect-to" value={data.url} />
                    <button
                      type="submit"
                      className="text-blue-600 hover:underline"
                    >
                      Удалить комментарий
                    </button>
                  </Form>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
      {user ? (
        <Form className="mt-8 flex items-start gap-4" method="post">
          <input type="hidden" name="postId" value={quest.id} />
          <div>
            <textarea
              placeholder="Ваш комментарий"
              name="text"
              className="w-64 border px-1"
              defaultValue={actionData?.fields?.text}
            ></textarea>
            {actionData?.fieldErrors?.text ? (
              <p className="text-sm font-semibold text-red-600">
                {actionData?.fieldErrors?.text}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            className="block rounded bg-blue-600 px-4 py-1 text-lg font-semibold text-white"
          >
            Отправить
          </button>
        </Form>
      ) : null}
    </div>
  );
}
