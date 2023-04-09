import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import bcrypt from "bcryptjs";

export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();

  const id = form.get("id");
  const username = form.get("username");
  const email = form.get("email");
  const password = form.get("password");
  const role = form.get("role");
  const city = form.get("city");
  const phone = form.get("phone");
  const legalName = form.get("legalName");
  const inn = form.get("inn");

  if (
    typeof id !== "string" ||
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof role !== "string" ||
    typeof city !== "string" ||
    typeof phone !== "string" ||
    typeof legalName !== "string" ||
    typeof inn !== "string"
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: `Форма неверно отправлена.`,
    });
  }

  const fields = {
    id,
    username,
    email,
    password,
    role,
    city,
    phone,
    legalName,
    inn,
  };

  const sameUsername = await db.user.findFirst({
    where: { username, NOT: [{ id }] },
  });
  const sameEmail = await db.user.findFirst({
    where: { email, NOT: [{ id }] },
  });
  if (sameUsername || sameEmail) {
    return badRequest({
      fieldErrors: null,
      fields,
      formError: sameUsername
        ? `Имя пользователя ${username} занято. `
        : "" + sameEmail
        ? `Электронная почта ${email} занята. `
        : "",
    });
  }

  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    throw new Response("Пользователь не найден", { status: 404 });
  } else {
    const passwordHash =
      password !== "" ? await bcrypt.hash(password, 10) : user.passwordHash;
    await db.user.update({
      where: { id },
      data: {
        username,
        email,
        passwordHash,
        role,
        city,
        phone,
        legalName,
        inn,
      },
    });
  }

  return redirect(`/admin/users/${id}`);
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const user = await db.user.findUnique({ where: { id: params.userId } });
  if (!user) {
    throw new Response("Пользователь не найден", { status: 404 });
  }
  return json({ user });
};

export default function UserEditRoute() {
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h2 className='mb-2 font-medium'>Редактирование пользователя</h2>
      <Form method='post' className='mt-2'>
        <input
          type='hidden'
          name='id'
          value={actionData?.fields?.id || data.user.id}
          required
        />
        <label>
          <p>Имя пользователя</p>
          <input
            type='text'
            name='username'
            className='border'
            defaultValue={actionData?.fields?.username || data.user.username}
            required
          />
        </label>
        <label>
          <p>E-mail</p>
          <input
            type='email'
            name='email'
            className='border'
            defaultValue={actionData?.fields?.email || data.user.email}
            required
          />
        </label>
        <label>
          <p>Новый пароль</p>
          <input type='password' name='password' className='border' />
        </label>
        <label>
          <p>Тип аккаунта</p>
          <select
            name='role'
            className='border'
            defaultValue={actionData?.fields?.role || data.user.role}
          >
            <option value='user'>Пользователь</option>
            <option value='creator'>Разработчик турпродукта</option>
            <option value='placeowner'>Владелец объекта</option>
            <option value='admin'>Администратор</option>
          </select>
        </label>

        <hr className='my-4' />

        <label>
          <p>Город</p>
          <input
            type='text'
            name='city'
            className='border'
            defaultValue={actionData?.fields?.city || data.user.city || ""}
          />
        </label>
        <label>
          <p>Телефон</p>
          <input
            type='tel'
            name='phone'
            className='border'
            defaultValue={actionData?.fields?.phone || data.user.phone || ""}
          />
        </label>
        <label>
          <p>Юр. наименование</p>
          <input
            type='text'
            name='legalName'
            className='border'
            defaultValue={
              actionData?.fields?.legalName || data.user.legalName || ""
            }
          />
        </label>
        <label>
          <p>ИНН</p>
          <input
            type='text'
            name='inn'
            className='border'
            defaultValue={actionData?.fields?.inn || data.user.inn || ""}
          />
        </label>
        <div>
          <button
            type='submit'
            className='mt-8 block bg-blue-600 px-4 py-2 text-white'
          >
            Сохранить изменения
          </button>
          <Link
            to={`../${data.user.id}`}
            className='mt-1 inline-block border px-4 py-2'
          >
            Вернуться
          </Link>
        </div>
        <div>
          {actionData?.formError ? <p>{actionData.formError}</p> : null}
        </div>
      </Form>
    </div>
  );
}
