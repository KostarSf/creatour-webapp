import type { Place, Product } from "@prisma/client";
import { Form, Link } from "@remix-run/react";
import clsx from "clsx";
import { NoImageIcon } from "./NoImageIcon";
import CardDate from "./CardDate";
import type { ReactNode } from "react";

export function ProductCard({
  type,
  object,
  buyed,
  userId,
  canBuy,
}: CardProps & {
  buyed?: boolean;
  userId?: string;
  canBuy: boolean;
}) {
  return (
    <ProductCardBase
      footer={
        type === "product" ? (
          <>
            <div></div>
            {userId ? (
              <Form
                method='POST'
                onSubmit={(e) => {
                  if (
                    !confirm(
                      object.price > 0
                        ? `Приобрести за ${object.price} ₽?`
                        : "Записаться бесплатно?"
                    )
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                <input type='hidden' name='userId' value={userId} />
                <input type='hidden' name='productId' value={object.id} />
                <button
                  name='intent'
                  value='activate-product'
                  disabled={buyed || !canBuy}
                  className={clsx(
                    "uppercase px-6 py-2 rounded  font-medium transition-colors",
                    !buyed
                      ? "text-blue-600 hover:bg-blue-200 bg-blue-100"
                      : "text-green-600 bg-green-100"
                  )}
                >
                  {buyed
                    ? "Приобретено"
                    : object.price === 0
                    ? "Бесплатно"
                    : object.price + " ₽"}
                </button>
              </Form>
            ) : null}
          </>
        ) : null
      }
      type={type}
      object={object}
    />
  );
}

export function ServiceProductCard({ type, object }: CardProps) {
  return (
    <ProductCardBase
      footer={
        <>
          <Form method='POST'>
            <input type='hidden' name={`${type}Id`} value={object.id} />
            <button
              type='submit'
              name='intent'
              value={`${type}-active-toggle`}
              className={clsx(
                "uppercase px-6 py-2 rounded  font-medium transition-colors",
                object.active
                  ? "text-green-600 hover:bg-green-200 bg-green-100"
                  : "text-gray-600 hover:bg-gray-200 bg-gray-100"
              )}
            >
              {object.active ? "Активно" : "Неактивно"}
            </button>
          </Form>
          <Link
            to={`/admin/${type}s/${object.id}/edit`}
            className='uppercase px-6 py-2 rounded text-blue-600 font-medium hover:bg-blue-100 transition-colors'
          >
            Изменить
          </Link>
        </>
      }
      topLeftText={
        type === "product"
          ? object.price === 0
            ? "Бесплатно"
            : object.price + " ₽"
          : ""
      }
      type={type}
      object={object}
    />
  );
}

type CardProps =
  | {
      type: "place";
      object: Place;
    }
  | {
      type: "product";
      object: Product;
    };

type CardBaseProps = CardProps & {
  topLeftText?: string;
  footer?: ReactNode;
};

function ProductCardBase({ type, object, topLeftText, footer }: CardBaseProps) {
  return (
    <div className='shadow md:rounded px-6 md:px-0 overflow-hidden flex flex-col lg:flex-row lg:items-stretch'>
      <Link
        to={`/${type}s/${object.id}`}
        className='bg-slate-300 h-48 lg:h-auto lg:w-[40%] -mx-6 md:mx-0 relative block text-white flex-shrink-0 md:rounded overflow-hidden'
      >
        {object.image ? (
          <div className='absolute inset-0'>
            <img
              src={`/images/${type}s/` + object.image}
              alt={object.name}
              className='w-full h-full object-cover object-center'
            />
          </div>
        ) : (
          <div className='w-full h-full grid place-items-center'>
            <NoImageIcon className='w-32 h-32 text-slate-100' />
          </div>
        )}
        <div className='absolute inset-0 flex flex-col justify-between bg-black/10 p-6'>
          <div className='flex justify-between'>
            {type === "product" && (
              <>
                <div className='text-base/none uppercase font-medium'>
                  {topLeftText}
                </div>
                <div className='text-right'>
                  {object.beginDate ? (
                    <CardDate date={object.beginDate} />
                  ) : null}
                </div>
              </>
            )}
          </div>
          <div className='flex items-center justify-between'>
            <p className='text-base/none'>{object.address}</p>
            <img
              src='/images/landing/arrow_right.svg'
              alt='arrow_right.svg'
              className='inline px-2'
            />
          </div>
        </div>
      </Link>
      <div className='flex flex-col pb-6 gap-12 md:px-6 pt-3 flex-1 lg:min-h-[12rem]'>
        <div className='flex-1'>
          <p className='font-serif text-2xl md:text-3xl font-bold'>
            {object.name}
          </p>
          <p className='text-lg text-slate-700'>{object.short}</p>
        </div>
        {footer && (
          <div className='flex items-center justify-between flex-wrap gap-2'>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
