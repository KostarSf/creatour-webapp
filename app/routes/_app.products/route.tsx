import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ProductCard } from "~/components/ProductCard";
import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUserId, requireUserId } from "~/utils/session.server";

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return json(
      {
        error: "Некорректный пользователь",
      },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === 'activate-product') {
    const productId = await formData.get('productId');
    const userId = await formData.get("userId");

    if (typeof productId !== 'string' || typeof userId !== 'string') {
      return badRequest({
        error: 'Ошибка запроса'
      });
    }

    const product = await db.product.findUnique({ where: { id: productId }})
    const user = await db.user.findUnique({ where: {id: userId} })

    if (!product || !user) {
      return badRequest({
        error: 'Ошибка запроса'
      })
    }

    const buyed = await db.product.findFirst({
      where: {
        buyers: {
          some: {
            id: product.id
          }
        }
      }
    })

    if (buyed) {
      return json({});
    }

    await db.product.update({
      where: { id: product.id },
      data: {
        buyers: {
          connect: {
            id: user.id
          }
        }
      }
    })

    await db.check.create({
      data: {
        productId: product.id,
        buyerId: user.id,
        price: product.price
      }
    })
  } else {
    return badRequest({
      error: "Неподдерживаемое действие",
    });
  }

  return json({
    error: null,
  });
};

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);
  const user = userId
    ? await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          activeProducts: {
            select: {
              id: true,
            },
          },
        },
      })
    : null;

  const products = await db.product.findMany({
    where: {
      active: true,
      beginDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      beginDate: 'asc'
    }
  });

  return json({ products, user });
};

export default function ProductsCatalog() {
  const { products, user } = useLoaderData<typeof loader>();

  return (
    <>
      <div className='my-6 md:my-12'>
        <h1 className='font-medium text-xl'>Календарь мероприятий</h1>
      </div>
      <div className='my-6 md:my-12'>
        {products.length === 0 ? (
          <p className='text-center mt-24 text-xl text-slate-400'>
            Каталог пока что пуст! Зайдите позже
          </p>
        ) : (
          <div className='space-y-6 mt-6 md:mt-12 -mx-6 md:mx-auto max-w-7xl'>
            {products.map((product) => (
              <ProductCard
                type='product'
                object={product}
                key={product.id}
                canBuy={user?.role === 'user' || false}
                buyed={
                  user?.activeProducts.findIndex((p) => p.id === product.id) !==
                  -1
                }
                userId={user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
