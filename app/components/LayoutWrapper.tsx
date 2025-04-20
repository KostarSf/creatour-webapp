import type React from "react";
import { cn } from "~/lib/utils";

export default function LayoutWrapper({ className, ...props }: React.ComponentProps<"div">) {
	return <div {...props} className={cn("mx-auto w-full max-w-6xl md:px-10", className)} />;
}
