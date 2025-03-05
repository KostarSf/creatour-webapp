import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ProductItem from "~/components/old/ProductItem";
import { db } from "~/utils/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
	const products = await db.product.findMany({
		include: { rating: true },
		where: { active: true },
	});
	return { products };
}

export default function AllProducts() {
	const params = useLoaderData<typeof loader>();

	return (
		<>
			{params.products.length ? (
				params.products.map((p) => {
					const ratingsCount = p.rating.length;
					const ratingsSum = p.rating
						.map((r) => r.value)
						.reduce((prev, cur) => prev + cur, 0);
					const totalRatimg =
						Math.round((ratingsSum / ratingsCount) * 100) / 100;

					return (
						<ProductItem
							key={p.id}
							id={p.id}
							name={p.name}
							short={p.short}
							type={p.type}
							image={p.image}
							rating={totalRatimg}
						/>
					);
				})
			) : (
				<p>Здесь пока пусто</p>
			)}
		</>
	);
}
