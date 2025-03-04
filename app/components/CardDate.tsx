type Props = {
	date: string | Date;
	className?: string;
};

export default function CardDate(props: Props) {
	const date =
		typeof props.date === "string" ? new Date(props.date) : props.date;

	return (
		<div className={props.className}>
			<p className="font-bold font-serif text-xl/none tracking-wide">
				{date.toLocaleTimeString("ru-ru", {
					hour: "2-digit",
					minute: "2-digit",
				})}
			</p>
			<p className="text-base/none">
				{date.toLocaleDateString("ru-ru", {
					day: "numeric",
					month: "long",
				})}
			</p>
		</div>
	);
}
