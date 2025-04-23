import type { ComponentPropsWithRef } from "react";
import { useId } from "react";
import { cn } from "~/lib/utils";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface InfoFieldProps extends ComponentPropsWithRef<"input"> {
	label: string;
}

export function InfoField({ label, className, ...other }: InfoFieldProps) {
	const id = useId();

	return (
		<div className={cn("grid space-y-1.5", className)}>
			<Label htmlFor={other.id ?? id}>{label}</Label>
			<Input {...other} id={other.id ?? id} />
		</div>
	);
}
