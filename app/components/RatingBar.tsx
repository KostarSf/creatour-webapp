import type { Rating } from "@prisma-app/client";
import clsx from "clsx";
import { StarIcon } from "lucide-react";
import type React from "react";

import { cn } from "~/lib/utils";

interface RatingBarProps extends React.ComponentProps<"span"> {
	ratings: Rating[];
}

export default function RatingBar({ ratings, className, ...props }: RatingBarProps) {
	const totalRating = Math.ceil(
		ratings.reduce((prev, rating) => prev + rating.value, 0) / ratings.length / 2,
	);

	return (
		<span {...props} className={cn("flex flex-row-reverse items-center gap-2", className)}>
			{Array.from(Array(5)).map((_, index) => (
				<StarIcon
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={index}
					className={clsx("size-4 text-yellow-500", totalRating > index ? "fill-yellow-500" : "")}
				/>
			))}
		</span>
	);
}
