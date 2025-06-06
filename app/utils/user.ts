import { useMemo } from "react";
import { useMatches } from "react-router";
import type { CurrentUser } from "~/models/users";

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(id: string): Record<string, unknown> | undefined {
	const matchingRoutes = useMatches();
	const route = useMemo(() => matchingRoutes.find((route) => route.id === id), [matchingRoutes, id]);
	return route?.data as Record<string, unknown> | undefined;
}

function isUser(user: unknown): user is CurrentUser {
	return !!user && typeof user === "object" && "email" in user && typeof user.email === "string";
}

export function useOptionalUser(): CurrentUser | undefined {
	const data = useMatchesData("root");
	if (!data || !isUser(data.user)) {
		return undefined;
	}
	return data.user;
}

export function useUser(): CurrentUser {
	const maybeUser = useOptionalUser();
	if (!maybeUser) {
		throw new Error(
			"No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
		);
	}
	return maybeUser;
}
