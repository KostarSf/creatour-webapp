import { Link } from "react-router";

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
			className="block rounded-sm bg-blue-500 px-4 py-2 text-center font-semibold text-white transition hover:bg-blue-400 hover:shadow-blue-100 hover:shadow-md sm:inline-block"
		>
			{text}
		</Link>
	);
}
