import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { CheckData } from "~/components/CheckTable";
import CheckTable from "~/components/CheckTable";
import { db } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  if (!userId) throw redirect("/");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw redirect("/");

  const checksList = await db.check.findMany({
    where: {
      product: {
        creatorId: userId
      }
    },
    include: {
      product: {
        include: {
          creator: true,
        },
      },
      buyer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const checks: CheckData[] = checksList.map((check) => ({
    id: check.id,
    buyerName: check.buyer.username,
    buyerEmail: check.buyer.email,
    sellerName: check.product.creator.username,
    productName: check.product.name,
    price: check.price,
    date: check.createdAt.toJSON(),
  }));

  return json({ checks });
};

export default function UserChecksPage() {
  const { checks } = useLoaderData<typeof loader>();

  return (
    <>
      <div className='my-6 md:my-12'>
        <h1 className='font-medium text-xl'>Продажи ваших турпродуктов</h1>
      </div>
      <div className='my-6 md:my-12 overflow-x-auto'>
        <CheckTable checks={checks} />
      </div>
    </>
  );
}