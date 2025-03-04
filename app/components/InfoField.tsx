import type { ComponentPropsWithRef } from "react";
import { forwardRef } from "react";

interface InfoFieldProps extends ComponentPropsWithRef<"input"> {
	label: string;
	editable?: boolean | undefined;
}

export const InfoField = forwardRef<HTMLInputElement, InfoFieldProps>(
	({ disabled, label, defaultValue, editable, ...other }, forwardedRef) => (
		<div className="flex items-baseline gap-2">
			<p className="w-24 text-blue-500 flex-shrink-0">{label}</p>
			<div className="flex-1">
				<input
					ref={forwardedRef}
					disabled={editable !== false ? disabled : true}
					defaultValue={defaultValue || ""}
					placeholder="—"
					className="border disabled:border-transparent px-2 py-1 rounded w-full transition-colors enabled:placeholder:text-transparent"
					{...other}
				/>
			</div>
		</div>
	),
);
