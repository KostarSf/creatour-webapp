import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  const users = await db.user.findMany();
  return json({ users });
};

export default function UsersList() {
  const data = useLoaderData<typeof loader>();

  let usersList = <></>;

  if (data.users.length === 0) {
    usersList = <p className="my-2">Пользователей пока нет</p>;
  } else {
    usersList = (
      <div>
        {data.users.map((user) => (
          <NavLink
            to={user.id}
            prefetch="intent"
            key={user.id}
            className="my-2 block"
            style={({ isActive }) =>
              isActive ? { background: "#eee" } : undefined
            }
          >
            <p>
              <b>{user.username}</b> - {user.role}
            </p>
            <p>{user.email}</p>
          </NavLink>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      <div>
        <Link to="new" className="text-blue-600 hover:underline">
          + Добавить пользователя
        </Link>
        {usersList}
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
