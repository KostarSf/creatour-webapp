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
			<p className="mb-2 text-sm text-slate-600">{firstParagraph}</p>
			<p className="mb-2 text-sm text-slate-600">{secondParagraph}</p>
			<hr className="mt-4 mb-2" />
			<p className="mb-2 font-normal text-slate-600">{actionParagraph}</p>
			{actionButton}
		</>
	);
}
