import { data } from "react-router";

/**
 * This helper function helps us returning the accurate HTTP status,
 * 400 Bad Request, to the client.
 */
export const badRequest = <T>(body: T) => data(body, { status: 400 });
