export default function FeedbackFormField({
	caption,
	placeholder,
	required,
	name,
	type,
}: {
	caption?: string;
	placeholder?: string;
	required?: boolean;
	name: string;
	type: "text" | "email" | "tel";
}) {
	return (
		<>
			{caption ? (
				<label
					htmlFor={"feedbackForm_" + name}
					className="mt-3 px-2 text-sm font-semibold text-slate-500"
				>
					{caption}
				</label>
			) : null}
			<input
				type={type}
				name={name}
				id={"feedbackForm_" + name}
				className={"rounded border px-2 py-1" + (!caption ? " mt-3" : "")}
				required={required}
				placeholder={placeholder}
			/>
		</>
	);
}
