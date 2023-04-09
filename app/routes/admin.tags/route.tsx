import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  const tags = await db.tag.findMany();
  return json({ tags });
};

export default function TagsList() {
  const data = useLoaderData<typeof loader>();

  let tagsList = <></>;

  if (data.tags.length === 0) {
    tagsList = <p className='my-4'>Тегов пока нет</p>;
  } else {
    tagsList = (
      <div className='mt-2 flex flex-col gap-1'>
        {data.tags.map((tag) => (
          <NavLink
            to={tag.id}
            prefetch='intent'
            key={tag.id}
            className='block'
            style={({ isActive }) =>
              isActive ? { background: "#eee" } : undefined
            }
          >
            <p>{tag.name}</p>
          </NavLink>
        ))}
      </div>
    );
  }

  return (
    <div className='flex gap-4'>
      <div className='flex-shrink-0'>
        <Link to='new' className='text-blue-600 hover:underline'>
          + Добавить тег
        </Link>
        {tagsList}
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
