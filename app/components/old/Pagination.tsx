import { Link } from "@remix-run/react";

export default function Pagination({
	className,
	page,
	total,
}: {
	className?: string;
	page: number;
	total: number;
}) {
	if (total === 1) return <></>;

	const pagesLinks: React.ReactNode[] = [];

	if (total > 7) {
		if (page > 4) {
			pagesLinks.push(
				<PageLink page={1} key={1} />,
				<span className="px-2" key={"predots"}>
					...
				</span>,
			);
		} else {
			for (let i = 1; i <= 5; i++) {
				pagesLinks.push(<PageLink page={i} selected={i === page} key={i} />);
			}
		}
		if (page >= 5 && page < total - 3) {
			for (let i = page - 1; i <= page + 1; i++) {
				pagesLinks.push(<PageLink page={i} selected={i === page} key={i} />);
			}
		}
		if (page < total - 3) {
			pagesLinks.push(
				<span className="px-2" key={"postdots"}>
					...
				</span>,
				<PageLink page={total} key={total} />,
			);
		} else {
			for (let i = total - 4; i <= total; i++) {
				pagesLinks.push(<PageLink page={i} selected={i === page} key={i} />);
			}
		}
	} else {
		for (let i = 1; i <= total; i++) {
			pagesLinks.push(<PageLink page={i} selected={i === page} key={i} />);
		}
	}

	return (
		<div className={className}>
			<span className="inline-block text-right" style={{ width: "85px" }}>
				{page > 1 ? <PageLink page={page - 1} title="< назад" /> : null}
			</span>
			{pagesLinks}
			<span className="inline-block text-left" style={{ width: "85px" }}>
				{page < total ? <PageLink page={page + 1} title="вперед >" /> : null}
			</span>
		</div>
	);
}

function PageLink({
	page,
	selected = false,
	title = String(page),
}: {
	page: number;
	selected?: boolean;
	title?: string;
}) {
	return (
		<Link
			to={`?page=${page}`}
			className={`px-1 text-slate-600 hover:text-blue-500 hover:underline sm:px-2 ${selected ? "font-semibold text-black underline" : ""}`}
		>
			{title}
		</Link>
	);
}
