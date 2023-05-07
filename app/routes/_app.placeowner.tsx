import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import type { ComponentPropsWithRef } from "react";
import { forwardRef, useEffect, useState } from "react";
import { db } from "~/utils/db.server";
import { logout, requireUserId } from "~/utils/session.server";

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "placeowner") {
    return json(
      {
        error: "Некорректный пользователь",
      },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const { city, phone, legalName, inn, address } = Object.fromEntries(formData);

  if (
    typeof city !== "string" ||
    typeof phone !== "string" ||
    typeof legalName !== "string" ||
    typeof inn !== "string" ||
    typeof address !== "string"
  ) {
    throw json({ error: "Указаны неверные значения" }, { status: 400 });
  }

  await db.user.update({
    where: { id: userId },
    data: {
      city: city || user.city,
      phone: phone || user.phone,
      legalName: legalName || user.legalName,
      inn: inn || user.inn,
      address: address || user.address,
    },
  });

  return json({
    error: null,
  });
};

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user) throw logout(request);
  if (user.role !== "placeowner") throw redirect("/user");

  const places = await db.place.findMany({
    where: {
      creatorId: user.id
    }
  })

  return json({ user, places });
};

export default function PlaceownerPage() {
  const { user, places } = useLoaderData<typeof loader>();
  const [changingInfo, setChangingInfo] = useState(false);

  const fetcher = useFetcher<typeof action>();

  useEffect(() => {
    if (fetcher.data?.error) {
      alert(fetcher.data.error);
    } else {
      setChangingInfo(false);
    }
  }, [fetcher.data]);

  const submitAvatar = (files: FileList | null) => {
    if (files) {
      console.log(files[0]);
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("avatar", files[0]);
      fetcher.submit(formData, {
        method: "POST",
        action: "/api/upload-avatar",
        encType: "multipart/form-data",
      });
    } else {
      console.log("No image selected");
    }
  };

  return (
    <>
      <div className='my-6 md:my-12'>
        <h1 className='font-medium text-xl'>Карточка владельца объекта</h1>
      </div>
      <fetcher.Form
        method='POST'
        className='my-6 md:my-12 border shadow-lg shadow-blue-900/10 p-6 -mx-6 md:mx-auto md:rounded-lg max-w-7xl'
      >
        <div className='flex justify-between items-start'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 rounded-full overflow-hidden bg-slate-400 hover:bg-slate-300 transition-colors flex-shrink-0 relative'>
              <input
                type='file'
                name='avatar'
                accept='image/*'
                className='sr-only'
                id='avatar-input'
                onChange={(e) => submitAvatar(e.target.files)}
              />
              <label
                htmlFor='avatar-input'
                className='w-full h-full block cursor-pointer'
              ></label>
              <div className='absolute inset-0 grid place-items-center pointer-events-none'>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt='avatar'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth='1.5'
                    stroke='currentColor'
                    className='w-8 h-8 text-slate-100'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'
                    />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <p className='font-serif font-bold text-xl/none'>
                {user.username}
              </p>
              <p>ID {user.id.split("-")[0].toUpperCase()}</p>
            </div>
          </div>
          <button
            onClick={() => setChangingInfo(true)}
            type='button'
            className={clsx(
              "uppercase text-blue-500 font-medium px-4 py-1 hover:underline",
              changingInfo && "hidden"
            )}
          >
            Изменить
          </button>
          <button
            type='submit'
            className={clsx(
              "uppercase text-blue-500 bg-blue-50 px-4 py-1 rounded hover:bg-blue-100 transition-colors font-medium",
              !changingInfo && "hidden"
            )}
          >
            Сохранить
          </button>
        </div>
        <div className='flex flex-col gap-3 mt-6 md:pl-16 lg:flex-row'>
          <div className='space-y-3'>
            <InfoField
              type='text'
              disabled={!changingInfo}
              label='Город'
              name='city'
              defaultValue={user.city || ""}
            />
            <InfoField
              type='text'
              editable={false}
              label='E-mail'
              name='email'
              defaultValue={user.email || ""}
            />
            <InfoField
              type='text'
              disabled={!changingInfo}
              label='Телефон'
              name='phone'
              defaultValue={user.phone || ""}
            />
          </div>
          <div className='space-y-3 flex-1'>
            <InfoField
              type='text'
              disabled={!changingInfo}
              label='Юр. имя'
              name='legalName'
              defaultValue={user.legalName || ""}
            />
            <InfoField
              type='text'
              disabled={!changingInfo}
              label='ИНН'
              name='inn'
              defaultValue={user.inn || ""}
            />
            <InfoField
              type='text'
              disabled={!changingInfo}
              label='Адрес'
              name='address'
              defaultValue={user.address || ""}
            />
          </div>
        </div>
      </fetcher.Form>
      <div className='my-6 md:my-12'>
        <div className='flex items-baseline justify-between flex-wrap gap-3'>
          <p className='text-xl'>
            <span className='text-blue-500'>{user.username}</span> объекты
          </p>
          <Link
            to='/new-place'
            className='text-lg uppercase text-blue-500 font-medium hover:underline'
          >
            Добавить новый
          </Link>
        </div>
        {places.length === 0 ? (
          <p className='text-center mt-24 text-xl text-slate-400'>
            У вас пока нет объектов
          </p>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}

interface InfoFieldProps extends ComponentPropsWithRef<"input"> {
  label: string;
  editable?: boolean | undefined;
}

const InfoField = forwardRef<HTMLInputElement, InfoFieldProps>(
  ({ disabled, label, defaultValue, editable, ...other }, forwardedRef) => (
    <div className='flex items-baseline gap-2'>
      <p className='w-24 text-blue-500 flex-shrink-0'>{label}</p>
      <div className='flex-1'>
        <input
          ref={forwardedRef}
          disabled={editable !== false ? disabled : true}
          defaultValue={defaultValue || ""}
          placeholder='—'
          className='border disabled:border-transparent px-2 py-1 rounded w-full transition-colors enabled:placeholder:text-transparent'
          {...other}
        />
      </div>
    </div>
  )
);
