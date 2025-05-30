import type { LoaderFunctionArgs } from "react-router";
import { Link, NavLink, Outlet, useLoaderData } from "react-router";
import { db } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const products = await db.product.findMany();
	return { products };
};

export default function ProductsList() {
	const data = useLoaderData<typeof loader>();

	let productsList = <></>;

	if (data.products.length === 0) {
		productsList = <p className="my-2">Турпродуктов пока нет</p>;
	} else {
		productsList = (
			<div className="mt-2 flex w-[25vw] flex-col gap-1">
				{data.products.map((product) => (
					<NavLink
						to={product.id}
						prefetch="intent"
						key={product.id}
						className="block"
						style={({ isActive }) => (isActive ? { background: "#eee" } : undefined)}
					>
						<p>
							<b>{product.name}</b> - {product.type}
						</p>
						<p>{product.short}</p>
					</NavLink>
				))}
			</div>
		);
	}

	return (
		<div className="flex gap-4">
			<div className="shrink-0">
				<Link to="new" className="text-blue-600 hover:underline">
					+ Добавить турпродукт
				</Link>
				{productsList}
			</div>
			<div>
				<Outlet />
			</div>
		</div>
	);
}
