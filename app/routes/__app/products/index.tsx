import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ProductItem from "~/components/ProductItem";
import { GetAllProducts } from "~/utils/storage";

export async function loader({ params }: LoaderArgs) {
  return json({ products: await GetAllProducts() });
}

export default function AllProducts() {
  const params = useLoaderData<typeof loader>();

  return (
    <>
      {params.products.length ? (
        params.products.map((p) => <ProductItem key={p.id} {...p} />)
      ) : (
        <p>Здесь пока пусто</p>
      )}
    </>
  );
}
