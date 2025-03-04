import React from "react";

export default function CatalogLayout({
	children,
	sideBlock,
}: {
	children: React.ReactNode;
	sideBlock?: React.ReactNode;
}) {
	return (
		<div className="flex flex-col md:flex-row ">
			<div className="flex flex-col gap-6 p-4 shadow md:flex-1 md:gap-12 md:border-none md:shadow-none">
				{children}
			</div>
			{sideBlock ? (
				<div className="border-t border-slate-100 shadow md:border-none md:shadow-none ">
					<div className="box-content p-4 md:sticky md:top-14 md:w-60 lg:top-16 lg:w-72">
						{sideBlock}
					</div>
				</div>
			) : null}
		</div>
	);
}
