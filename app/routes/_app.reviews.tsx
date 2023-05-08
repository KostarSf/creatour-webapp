import type { Comment, Media, Place, Product, Rating, User } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  const places = await db.place.findMany({
    include: {
      comments: {
        include: {
          user: true,
          media: true,
        },
      },
      rating: true,
    },
  });

  const products = await db.product.findMany({
    include: {
      comments: {
        include: {
          user: true,
          media: true,
        },
      },
      rating: true,
    },
  });

  return json({
    places: places.filter((place) => place.comments.length > 0),
    products: products.filter((product) => product.comments.length > 0),
  });
};

export default function ReviewsPage() {
  const { places, products } = useLoaderData<typeof loader>();

  return (
    <div>
      <div>
        <h1 className='my-6 md:my-12 text-2xl font-bold font-serif'>Отзывы</h1>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className='space-y-6 mb-12'>
          {places.map((place) => (
            <CommentSection key={place.id} name='place' parent={place} />
          ))}
        </div>
        <div className='space-y-6 mb-12'>
          {products.map((product) => (
            <CommentSection key={product.id} name='product' parent={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

const createRatingComponent = (rating: number) => {
  const totalRating = Math.ceil(rating / 2);

  return (
    <div className='flex gap-2 text-yellow-500'>
      {Array.from(Array(totalRating)).map((a, i) => (
        <svg
          key={i}
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 20 20'
          fill='currentColor'
          className='w-5 h-5'
        >
          <path
            fillRule='evenodd'
            d='M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z'
            clipRule='evenodd'
          />
        </svg>
      ))}
    </div>
  );
};


const CommentSection = ({name, parent}: {
  name: 'place' | 'product';
  parent: (Product | Place) & {
    rating: Rating[],
    comments: (Comment & {
        user: User,
        media: Media[],
    })[],
  }
}) => {
  return (
    <div>
      <Link to={`/${name}s/` + parent.id} className='flex flex-col gap-3 mb-6 md:flex-row md:gap-6 md:hover:shadow-lg md:shadow-blue-800/10 transition-shadow md:py-3 md:px-6 md:rounded-md md:-mx-6'>
        <div className='w-full md:w-36 h-48 md:h-24 rounded-md bg-slate-200 overflow-hidden grid place-items-center text-slate-50 shrink-0'>
          {parent.image ? (
            <img
              src={`/images/${name}s/` + parent.image}
              alt={parent.name}
              className='w-full h-full object-cover object-center'
            />
          ) : (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 20 20'
              fill='currentColor'
              className='w-24 h-24'
            >
              <path
                fillRule='evenodd'
                d='M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z'
                clipRule='evenodd'
              />
            </svg>
          )}
        </div>
        <div className="grow flex flex-col">
          <p className='font-serif font-bold text-xl'>{parent.name}</p>
          <p className='text-slate-800 md:order-1'>{parent.short}</p>
          <div className='flex justify-between md:justify-start md:gap-12 items-center mt-3 md:mt-0 md:mb-3'>
            <p className='text-slate-500 text-sm md:order-1'>
              {parent.comments.length} отзывов
            </p>
            {parent.rating.length > 0
              ? createRatingComponent(
                  parent.rating.reduce(
                    (prev, rating) => prev + rating.value,
                    0
                  ) / parent.rating.length
                )
              : null}
          </div>
        </div>
      </Link>
      <div className='space-y-6'>
        {parent.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            rating={parent.rating}
          />
        ))}
      </div>
    </div>
  );
}


const CommentItem = ({
  comment,
  rating,
}: {
  comment: Comment & {
    user: User;
    media: Media[];
  };
  rating: Rating[];
}) => {
  return (
    <div key={comment.id}>
      <div className='flex items-center gap-4'>
        <div className='w-10 h-10 rounded-full overflow-hidden bg-slate-300 shrink-0'>
          {comment.user.avatar && (
            <img
              src={comment.user.avatar}
              alt=''
              className='w-full h-full object-cover object-center'
            />
          )}
        </div>
        <div className='flex-1'>
          <div className='flex items-baseline gap-2 justify-between md:justify-start md:gap-12'>
            <p className='text-lg/none font-medium'>{comment.user.username}</p>
            <p className='text-slate-500'>
              {new Date(comment.createdAt).toLocaleString("ru-ru", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            {(() => {
              const userRating = rating.filter(
                (rating) => rating.userId === comment.userId
              );
              if (userRating.length === 0) return null;
              return createRatingComponent(userRating[0].value);
            })()}
          </div>
        </div>
      </div>
      <div className='mt-3 ml-14'>
        <p>{comment.text}</p>
      </div>
    </div>
  );
};
