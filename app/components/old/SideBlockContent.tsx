export default function SideBlockContent({
	firstParagraph,
	secondParagraph,
	actionText: actionParagraph,
	actionButton,
}: {
	firstParagraph: React.ReactNode;
	secondParagraph: React.ReactNode;
	actionText: React.ReactNode;
	actionButton: React.ReactNode;
}) {
	return (
		<>
			<p className="mb-2 text-slate-600 text-sm">{firstParagraph}</p>
			<p className="mb-2 text-slate-600 text-sm">{secondParagraph}</p>
			<hr className="mt-4 mb-2" />
			<p className="mb-2 font-normal text-slate-600">{actionParagraph}</p>
			{actionButton}
		</>
	);
}
