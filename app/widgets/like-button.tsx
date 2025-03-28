import confetti from "canvas-confetti";
import clsx from "clsx";
import { HeartIcon } from "lucide-react";
import { useRef } from "react";
import { href, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import type { FavoritesAction } from "~/routes/api.favorites";
import { useOptionalUser } from "~/utils/user";

interface LikeProductButtonProps {
	productId: string;
	className?: string;
}

export function LikeProductButton({ productId, className }: LikeProductButtonProps) {
	const buttonRef = useRef<HTMLButtonElement>(null);

	const user = useOptionalUser();
	const liked = user?.favoriteProducts.findIndex((p) => p.id === productId) !== -1;

	const fetcher = useFetcher<FavoritesAction>();
	const optimisticLiked = fetcher.formData?.has("intent")
		? fetcher.formData.get("intent") === "add"
		: liked;

	const fireConfetti = () => {
		const button = buttonRef.current;

		if (button) {
			const rect = button.getBoundingClientRect();
			const x = rect.left + rect.width / 2;
			const y = rect.top + rect.height / 2;

			confetti({
				particleCount: 30,
				spread: 90,
				startVelocity: 25,
				ticks: 100,
				origin: {
					x: x / window.innerWidth,
					y: y / window.innerHeight,
				},
			});
		}
	};

	return user ? (
		<fetcher.Form method="POST" action={href("/api/favorites")} preventScrollReset>
			<input type="hidden" name="productId" value={productId} />
			<input type="hidden" name="intent" value={optimisticLiked ? "remove" : "add"} />

			<Button
				ref={buttonRef}
				type="submit"
				size="icon"
				variant="ghost"
				className={className}
				onClick={() => !optimisticLiked && fireConfetti()}
			>
				<HeartIcon
					className={clsx(
						"transition duration-200",
						optimisticLiked ? "fill-rose-600 text-rose-600" : "fill-transparent",
					)}
				/>
			</Button>
		</fetcher.Form>
	) : null;
}
