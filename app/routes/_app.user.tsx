import { redirect, type LoaderArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { logout, requireUserId } from "~/utils/session.server";


export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user) throw logout(request);
  if (user.role === 'placeowner') throw redirect('/placeowner');
  if (user.role === "creator") throw redirect("/creator");

  return { user };
}


export default function UserPage() {
  const { user } = useLoaderData<typeof loader>()

  return <div>userpage</div>
}
