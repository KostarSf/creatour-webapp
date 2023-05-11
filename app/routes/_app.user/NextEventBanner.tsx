import type { Product } from "@prisma/client";
import { Link } from "@remix-run/react";
import clsx from "clsx";
import CardDate from "~/components/CardDate";

type Props = {
  product: Product,
  username: string,
  className?: string,
}

export default function NextEventBanner({ product, username, className }: Props) {
  return (
    <Link
      to={`/products/${product.id}`}
      className={clsx(
        "block relative bg-slate-200 h-72 lg:h-96",
        className
      )}
    >
      <div className='relative -mx-6 md:-mx-16 lg:-mx-32 h-full'>
        <img
          src={`/images/products/${product.image}` || undefined}
          alt={product.image || "изображение отсутствует"}
          className='w-full h-full object-cover object-center'
        />
        <div className='absolute inset-0 bg-black/50'></div>
      </div>

      <div className='absolute inset-0 text-white py-3 flex flex-col justify-between'>
        <div className='flex justify-between'>
          <p className='font-medium'>
            {username.split(" ").shift()}, ваше ближайшее событие
          </p>
          {product.beginDate && (
            <CardDate date={product.beginDate} className='text-right' />
          )}
        </div>
        <p className='font-serif text-2xl font-semibold text-center lg:text-3xl'>
          {product.name}
        </p>
        <p>{product.address}</p>
      </div>
    </Link>
  );
}
