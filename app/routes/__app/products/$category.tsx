import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import ProductItem from "~/components/ProductItem";
import { GetProductsByCategory } from "~/utils/storage";

export async function loader({ params }: LoaderArgs) {
  const category = params.category;
  if (!category) {
    return redirect("/projects");
  }
  return json({ projects: await GetProductsByCategory(category) });
}

export default function CategotyProjects() {
  const params = useLoaderData<typeof loader>();

  return (
    <>
      {params.projects.length ? (
        params.projects.map((p) => <ProductItem key={p.id} {...p} />)
      ) : (
        <p>Здесь пока пусто</p>
      )}
    </>
  );
}
