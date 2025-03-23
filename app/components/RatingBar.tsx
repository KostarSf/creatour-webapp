import type { Rating } from "@prisma/client";
import clsx from "clsx";

export default function RatingBar({
	ratings,
	className,
}: {
	ratings: Rating[];
	className?: string;
}) {
	if (ratings.length === 0) return <div className={className} />;

	const totalRating = Math.ceil(
		ratings.reduce((prev, rating) => prev + rating.value, 0) / ratings.length / 2,
	);

	return (
		<div className={clsx("flex gap-2 text-yellow-500", className)}>
			{Array.from(Array(totalRating)).map((a, i) => (
				<svg
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={i}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					role="graphics-symbol"
					className="h-5 w-5"
				>
					<path
						fillRule="evenodd"
						d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
						clipRule="evenodd"
					/>
				</svg>
			))}
		</div>
	);
}
