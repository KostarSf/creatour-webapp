import { Link } from "@remix-run/react";
import type { ReactNode } from "react";

type Props = {
	to: string;
	children?: ReactNode | ReactNode[];
};

export default function ActionLinkButton({ to, children }: Props) {
	return (
		<Link
			to={to}
			className="rounded bg-blue-100 px-4 py-1 font-medium text-blue-500 text-lg uppercase hover:bg-blue-200"
		>
			{children}
		</Link>
	);
}
