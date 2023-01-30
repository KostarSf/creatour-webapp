import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUser, requireUserId } from "~/utils/session.server";

function validateComment(comment: string) {
  if (comment.length < 4) {
    return `Комментарий слишком короткий`;
  }
}

export async function loader({ params, request }: LoaderArgs) {
  const place = await db.place.findUnique({
    where: { id: params.id },
  });
  if (!place) {
    throw new Response("Place not found", { status: 404 });
  }

  const comments = await db.comment.findMany({
    where: {
      postId: place.id,
    },
    include: { user: true },
  });

  const user = await getUser(request);

  return json({
    place: place,
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

export default function PlacePage() {
  const data = useLoaderData<typeof loader>();
  const place = data.place;
  const comments = data.comments;
  const user = data.user;

  const actionData = useActionData<typeof action>();

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
          <input type="hidden" name="postId" value={place.id} />
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
