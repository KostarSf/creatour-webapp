import type { ComponentPropsWithRef } from "react";
import { useId } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface InfoFieldProps extends ComponentPropsWithRef<"input"> {
	label: string;
}

export function InfoField({ label, ...other }: InfoFieldProps) {
	const id = useId();

	return (
		<div className="grid space-y-1.5">
			<Label htmlFor={other.id ?? id}>{label}</Label>
			<Input {...other} id={other.id ?? id} />
		</div>
	);
}
