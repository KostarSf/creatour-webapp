import type { Route } from "./+types/_app.places.$placeId";

import { Link, data, href } from "react-router";

import type { Place, Product } from "@prisma-app/client";
import LayoutWrapper from "~/components/LayoutWrapper";
import { ProductCard } from "~/components/ProductCard";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { db } from "~/utils/db.server";

export const loader = async ({ params }: Route.LoaderArgs) => {
	const place = await db.place.findFirst({
		where: { id: params.placeId },
		include: {
			routes: {
				include: {
					product: true,
				},
			},
		},
	});

	if (!place) {
		throw data("Объект не найден!", 404);
	}

	const { routes, ...placeWithoutRoutes } = place;

	return {
		place: placeWithoutRoutes,
		products: Array.from(
			new Map(routes.map((route) => route.product).map((product) => [product.id, product])).values(),
		),
	};
};

export default function PlacePage({ loaderData }: Route.ComponentProps) {
	const { place, products } = loaderData;

	return (
		<LayoutWrapper className="space-y-2">
			<p className="px-5 font-medium font-serif text-3xl md:px-0">{place.name}</p>

			<PlaceBlock place={place} />
			<div className="flex justify-end px-5 md:px-0">
				<Link
					to={href("/recognize")}
					className="mt-2 flex items-center gap-2 text-muted-foreground hover:underline"
				>
					<img
						src="/images/landing/arrow_right.svg"
						alt=""
						className="rotate-180 opacity-30 invert"
					/>
					Распознать другой объект
				</Link>
			</div>

			{products?.length ? <ProductsBlock products={products} className="mt-10" /> : null}
		</LayoutWrapper>
	);
}

function PlaceBlock({ place }: { place: Place }) {
	return (
		<article className="relative sm:grid sm:grid-cols-5">
			<img
				src={`/api/uploads/places/${place.image}`}
				alt={place.name}
				className="sm:-z-10 w-full bg-muted object-cover sm:absolute sm:top-2 sm:left-0 sm:h-full md:left-2 md:rounded-xl"
			/>
			<ScrollArea className="sm:col-span-3 sm:ml-2 sm:h-[500px] sm:rounded-xl sm:bg-white/60 sm:backdrop-blur-xl md:ml-0 lg:col-span-2">
				<div className="whitespace-pre-line p-5 pr-10 pb-20">{place.description}</div>
			</ScrollArea>
		</article>
	);
}

function ProductsBlock({ products, className }: { products: Product[]; className?: string }) {
	return (
		<section className={cn("", className)}>
			<p className="mb-2 px-5 font-medium font-serif text-2xl md:px-0">Возможно Вас заинтересует</p>
			<div className="flex flex-col gap-2">
				{products.map((product) => (
					<ProductCard
						key={product.id}
						type="product"
						object={product}
						className="max-md:rounded-none max-md:border-0"
					/>
				))}
			</div>
		</section>
	);
}
