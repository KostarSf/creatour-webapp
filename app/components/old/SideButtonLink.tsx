import { Link } from "@remix-run/react";
import React from "react";

export default function SideButtonLink({
	text,
	url,
}: {
	text: string;
	url: string;
}) {
	return (
		<Link
			to={url}
			className="block rounded bg-blue-500 px-4 py-2 text-center font-semibold text-white transition hover:bg-blue-400 hover:shadow-md hover:shadow-blue-100 sm:inline-block"
		>
			{text}
		</Link>
	);
}
