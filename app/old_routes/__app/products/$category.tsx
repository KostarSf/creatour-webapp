import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { useLoaderData } from "react-router";
import ProductItem from "~/components/old/ProductItem";
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
	return { products };
}

export default function CategotyProjects() {
	const params = useLoaderData<typeof loader>();

	return (
		<>
			{params.products.length ? (
				params.products.map((p) => {
					const ratingsCount = p.rating.length;
					const ratingsSum = p.rating.map((r) => r.value).reduce((prev, cur) => prev + cur, 0);
					const totalRatimg = Math.round((ratingsSum / ratingsCount) * 100) / 100;

					return <ProductItem key={p.id} {...p} rating={totalRatimg} />;
				})
			) : (
				<p>Здесь пока пусто</p>
			)}
		</>
	);
}
