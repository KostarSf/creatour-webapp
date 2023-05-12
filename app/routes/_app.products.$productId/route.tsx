import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import invariant from "tiny-invariant";
import CardDate from "~/components/CardDate";
import CommentItem from "~/components/CommentItem";
import RatingBar from "~/components/RatingBar";
import { db } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  invariant(params.productId, "productId must be set");

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

  const product = await db.product.findUnique({
    where: { id: params.productId },
    include: {
      comments: {
        include: {
          user: true,
          media: true,
        },
      },
      media: {
        orderBy: {
          community: "asc",
        },
      },
      rating: true,
      route: {
        include: {
          place: true,
        },
        orderBy: {
          order: 'asc'
        }
      },
    },
  });

  if (!product) throw json({}, { status: 404 });

  return json({ product, user });
};

export default function ProductPage() {
  const { product, user } = useLoaderData<typeof loader>();

  const buyed =
    user?.activeProducts.findIndex((p) => p.id === product.id) !== -1;

  const canBuy = user?.role === "user" || false;

  return (
    <>
      <div className='my-6 md:my-12'>
        <h1 className='font-bold text-2xl font-serif'>{product.name}</h1>
        <p className='mt-2'>{product.short}</p>
        <div className='flex items-center mt-6'>
          <div className='flex-1 md:flex-grow-0 md:mr-12'>
            <RatingBar ratings={product.rating} />
            <p className='text-slate-500'>{product.rating.length} оценок</p>
          </div>
          {product.beginDate && (
            <CardDate date={product.beginDate} className='text-right' />
          )}
        </div>
      </div>

      <Form
        method='POST'
        action='/products?index'
        onSubmit={(e) => {
          if (
            !confirm(
              product.price > 0
                ? `Приобрести за ${product.price} ₽?`
                : "Записаться бесплатно?"
            )
          ) {
            e.preventDefault();
          }
        }}
        className='my-12'
        preventScrollReset
      >
        <input type='hidden' name='userId' value={user?.id} />
        <input type='hidden' name='productId' value={product.id} />
        <input
          type='hidden'
          name='redirectTo'
          value={`/products/${product.id}`}
        />
        <button
          name='intent'
          value='activate-product'
          disabled={buyed || !canBuy}
          className={clsx(
            "uppercase px-6 py-2 rounded  font-medium transition-colors",
            canBuy
              ? !buyed
                ? "text-blue-600 hover:bg-blue-200 bg-blue-100"
                : "text-green-600 bg-green-100"
              : "text-blue-600 border border-blue-100"
          )}
        >
          {buyed
            ? "Приобретено"
            : product.price === 0
            ? "Бесплатно"
            : product.price + " ₽"}
        </button>
      </Form>

      <p className='font-serif text-xl font-semibold'>Галерея изображений</p>
      <div className='my-6 md:my-12 -mx-6 md:-mx-12'>
        <div className='flex gap-6 overflow-x-auto snap-x px-6 scroll-p-6'>
          {product.image && (
            <AlbumImage link={"/images/products/" + product.image} />
          )}
          {product.media.map((image) => (
            <AlbumImage
              link={image.url}
              key={image.id}
              community={image.community}
            />
          ))}
        </div>
      </div>

      {product.route.length > 0 && (
        <>
          <p className='font-serif text-xl font-semibold mt-24'>
            Места мероприятия
          </p>
          <div className='my-3'>
            {product.route.map((point) => (
              <div key={point.id} className='flex gap-3 items-center'>
                <div className='w-16 rounded-lg overflow-hidden h-12 bg-slate-300'>
                  {point.place.image && (
                    <img
                      src={"/images/places/" + point.place.image}
                      className='w-24 aspect-square object-cover rounded-md'
                      alt={point.place.image}
                    />
                  )}
                </div>

                <div>
                  <p className='font-medium text-lg/normal text-blue-500'>
                    {point.place.name}
                  </p>
                  <p className='text-slate-600'>{point.place.short}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {product.description && (
        <>
          <p className='font-serif text-xl font-semibold mt-24'>Описание</p>
          <p>{product.description}</p>
        </>
      )}

      <p className='font-serif text-xl font-semibold mt-24 mb-6'>Комментарии</p>
      <div className='space-y-6'>
        {product.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            rating={product.rating}
          />
        ))}
      </div>
      <div className='mb-12 mt-24'>
        {user ? (
          <Form
            method='POST'
            action='/api/add-comment'
            encType='multipart/form-data'
            preventScrollReset
            className=' max-w-3xl'
          >
            <input
              type='hidden'
              name='redirectTo'
              value={`/products/${product.id}`}
            />
            <input type='hidden' name='parentType' value='product' />
            <input type='hidden' name='parentId' value={product.id} />
            <input type='hidden' name='userId' value={user.id} />
            <textarea
              name='text'
              className='border px-2 py-1 rounded w-full min-h-[5rem]'
              placeholder='Напишите свой отзыв!'
            />
            <div className='flex justify-between items-baseline mt-2 gap-2'>
              {/* <div className="flex-1"></div> */}
              <input
                type='file'
                name='media'
                id='media-picker'
                accept='.png,.jpg,.jpeg,.webp'
                multiple
              />
              {/* <label htmlFor='media-picker' className="cursor-pointer hover:bg-gray-200 transition-colors rounded text-gray-500 p-2">
                <PaperClipIcon/>
              </label> */}
              <button
                type='submit'
                className='bg-blue-100 hover:bg-blue-200 transition-colors text-blue-600 px-4 py-2 rounded uppercase font-medium'
              >
                Отправить
              </button>
            </div>
          </Form>
        ) : (
          <p className='text-center text-slate-500'>
            Войдите, чтобы оставить комментарий
          </p>
        )}
      </div>
    </>
  );
}

function AlbumImage({
  link,
  community,
}: {
  link: string;
  community?: boolean;
}) {
  return (
    <div className='snap-center relative shrink-0 rounded-lg w-[95%] md:w-auto md:h-[50vh] aspect-square md:aspect-[4/3] overflow-hidden'>
      <img src={link} alt={link} className='object-cover w-full h-full' />
      {community && (
        <p className='absolute top-0 left-0 p-2 px-3 py-1 m-1 bg-white rounded font-medium'>
          Коммьюнити
        </p>
      )}
    </div>
  );
}

const PaperClipIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={clsx(className || "w-6 h-6")}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13'
    />
  </svg>
);
