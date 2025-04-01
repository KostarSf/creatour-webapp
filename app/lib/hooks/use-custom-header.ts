import { type UIMatch, useMatches } from "react-router";

export function useCustomHeader() {
	const matches = useMatches() as UIMatch<unknown, Partial<CustomHeaderHandle> | undefined>[];

	const isCustomHeader = matches.reduce((acc, match) => {
		if (match.handle?.customHeader) {
			return true;
		}

		return acc;
	}, false);

	return isCustomHeader;
}

export type CustomHeaderHandle = {
	customHeader: boolean;
};
