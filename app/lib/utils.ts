import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ZodObject, ZodRawShape, z } from "zod";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function validateSearchParams<A extends ZodRawShape, T extends ZodObject<A>>(
	searchParams: URLSearchParams,
	schema: T,
) {
	const { data, error } = schema.safeParse(Object.fromEntries(searchParams));
	if (error) {
		console.warn("Cant validate search params -", error);
	}
	return (data ?? null) as z.infer<T> | null;
}

export function getLocalDate(date: Date) {
	const localDate = new Date(date);
	localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
	return localDate.toISOString().slice(0, 16);
}
