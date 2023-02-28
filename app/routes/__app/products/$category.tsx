import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ProductItem from "~/components/ProductItem";
import { db } from "~/utils/db.server";

export async function loader({ params }: LoaderArgs) {
  const category = params.category;
  if (!category) {
    return redirect("/projects");
  }
  const products = await db.product.findMany({
    where: { type: category.substring(0, category.length - 1) },
  });
  return json({ products });
}

export default function CategotyProjects() {
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
