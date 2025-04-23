import { cn } from "~/lib/utils";

export const CardContainer = ({ className, ...props }: React.ComponentProps<"div">) => (
	<div
		{...props}
		className={cn("border p-6 shadow-blue-900/5 shadow-lg md:mx-0 md:rounded-lg", className)}
	/>
);
