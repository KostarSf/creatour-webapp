import { type LoaderArgs } from "@remix-run/node"
import { requireUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);

  return {};
}

export default function UserPage() {
  return <div>userpage</div>
}
