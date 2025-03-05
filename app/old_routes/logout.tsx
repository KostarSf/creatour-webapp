import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";

import { logout } from "~/utils/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
	return logout(request);
};

export const loader = async () => {
	return redirect("/products");
};
