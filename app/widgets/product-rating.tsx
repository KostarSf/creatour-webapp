import type { Rating } from "@prisma-app/client";
import { LoaderCircleIcon, StarIcon } from "lucide-react";
import React from "react";
import { href, useFetcher } from "react-router";

import RatingBar from "~/components/RatingBar";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { RateProductAction } from "~/routes/api.rate-product";
import { useOptionalUser } from "~/utils/user";

interface ProductRatingProps {
	rating: Rating[];
	productId: string;
	className?: string;
}

function ProductRating({ rating, className, productId }: ProductRatingProps) {
	const user = useOptionalUser();
	const currentRating = user?.ratings.find((rating) => rating.productId === productId)?.value ?? 0;

	const [open, setOpen] = React.useState(false);

	const fetcher = useFetcher<RateProductAction>();
	const pending = fetcher.state !== "idle";

	React.useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data?.success === true) {
			setOpen(false);
		}
	}, [fetcher]);

	if (!user) {
		return <RatingBar ratings={rating} className={className} />;
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<DialogTrigger>
						<RatingBar ratings={rating} className={className} />
					</DialogTrigger>
				</TooltipTrigger>
				<TooltipContent>
					<p>Оценить турпродукт</p>
				</TooltipContent>
			</Tooltip>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Оцените турпродукт</DialogTitle>
				</DialogHeader>

				<fetcher.Form id="user-rating-form" method="POST" action={href("/api/rate-product")}>
					<DialogRatingInput currentRating={currentRating} />
					<input type="hidden" name="productId" value={productId} />
				</fetcher.Form>

				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Отмена
						</Button>
					</DialogClose>
					<Button type="submit" form="user-rating-form" className="sm:w-32" disabled={pending}>
						{pending ? <LoaderCircleIcon className="animate-spin" /> : "Оценить"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function DialogRatingInput({ currentRating }: { currentRating: number }) {
	const [hoveredRating, setHoveredRating] = React.useState(0);
	const [newRating, setNewRating] = React.useState(currentRating);

	return (
		<div className="group my-12 flex justify-center">
			<input type="hidden" name="rating" value={newRating} />
			{new Array(5).fill(null).map((_, index) => (
				<button
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={index}
					data-hovered={index + 1 <= hoveredRating || undefined}
					data-active={index + 1 <= newRating || undefined}
					type="button"
					onMouseEnter={() => setHoveredRating(index + 1)}
					onMouseLeave={() => setHoveredRating(0)}
					onClick={() => setNewRating((rating) => (rating === index + 1 ? 0 : index + 1))}
					className="data-[hovered]:-translate-y-2 px-2 py-2 transition data-[active]:*:[svg]:fill-yellow-500 not-[[data-active]]:data-[hovered]:*:[svg]:fill-yellow-500/50 group-hover:data-[active]:not-[[data-hovered]]:*:[svg]:fill-yellow-500/50"
				>
					<StarIcon className="size-8 text-yellow-500 transition" />
				</button>
			))}
		</div>
	);
}

export { ProductRating };
