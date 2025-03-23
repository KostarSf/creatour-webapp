import type { ComponentPropsWithRef } from "react";
import { forwardRef } from "react";

interface InfoFieldProps extends ComponentPropsWithRef<"input"> {
	label: string;
	editable?: boolean | undefined;
}

export const InfoField = forwardRef<HTMLInputElement, InfoFieldProps>(
	({ disabled, label, defaultValue, editable, ...other }, forwardedRef) => (
		<div className="flex items-baseline gap-2">
			<p className="w-24 shrink-0 text-blue-500">{label}</p>
			<div className="flex-1">
				<input
					ref={forwardedRef}
					disabled={editable !== false ? disabled : true}
					defaultValue={defaultValue || ""}
					placeholder="—"
					className="w-full rounded-sm border px-2 py-1 transition-colors enabled:placeholder:text-transparent disabled:border-transparent"
					{...other}
				/>
			</div>
		</div>
	),
);
