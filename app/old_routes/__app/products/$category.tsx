import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ProductItem from "~/components/ProductItem";
import { db } from "~/utils/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
	const category = params.category;
	if (!category) {
		return redirect("/projects");
	}
	const products = await db.product.findMany({
		where: { type: category.substring(0, category.length - 1), active: true },
		include: { rating: true },
	});
	return json({ products });
}

export default function CategotyProjects() {
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

					return <ProductItem key={p.id} {...p} rating={totalRatimg} />;
				})
			) : (
				<p>Здесь пока пусто</p>
			)}
		</>
	);
}
