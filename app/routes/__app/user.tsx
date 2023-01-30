import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import CatalogLayout from "~/components/CatalogLayout";
import { getUser } from "~/utils/session.server";

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);
  if (!user) {
    throw redirect("/login");
  }
  return json({ user: user });
}

export default function UserPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <CatalogLayout sideBlock={<SideBlockUser user={data.user} />}>
      <></>
    </CatalogLayout>
  );
}

function SideBlockUser({
  user,
}: {
  user: {
    id: string;
    username: string;
  };
}) {
  return (
    <div>
      <p className="mb-2">
        Вы вошли как <span className="font-semibold">{user.username}</span>
      </p>
      <Form action="/logout" method="post">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-1 text-lg font-semibold text-white"
        >
          Выйти
        </button>
      </Form>
    </div>
  );
}
