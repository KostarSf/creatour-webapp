import type { LoaderArgs } from "@remix-run/node";
import { redirect, Response } from "@remix-run/node";
import { Link, NavLink, Outlet } from "@remix-run/react";
import type { CSSProperties } from "react";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role === "user") {
    return redirect("/products");
  }
  return new Response("Ok", { status: 200 });
};

export default function AdminPage() {
  const activeStyle: CSSProperties = {
    fontWeight: 500,
    color: "rgb(37 99 235)",
  };

  const links = [
    { link: "./users", title: "Пользователи" },
    { link: "./products", title: "Турпродукты" },
    { link: "./places", title: "Места" },
    { link: "./tags", title: "Теги" },
  ];

  return (
    <>
      <header className='p-2'>
        <div className='flex flex-wrap gap-2'>
          <div className='flex gap-1'>
            <Link to='/' className='font-semibold hover:underline'>
              Креатур
            </Link>
            {">"}
            <Link to='/admin' className='hover:underline'>
              Админпанель
            </Link>
          </div>
          <span>|</span>
          <div className='flex flex-wrap gap-2'>
            {links.map((link) => (
              <NavLink
                to={link.link}
                prefetch='intent'
                key={link.link}
                className='hover:underline'
                style={({ isActive }) => (isActive ? activeStyle : undefined)}
              >
                {link.title}
              </NavLink>
            ))}
          </div>
        </div>
      </header>
      <main className='p-2'>
        <Outlet />
      </main>
    </>
  );
}
