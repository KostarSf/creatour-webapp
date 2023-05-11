import { Link, NavLink, Outlet, useSearchParams } from "@remix-run/react";

export default function AuthLayout() {
  const [searchParams] = useSearchParams();

  return (
    <div className='flex min-h-screen w-screen items-stretch'>
      <div className='flex-grow md:flex-shrink-0 md:flex-grow-0'>
        <div className='bg-white px-6 py-8 md:px-12 md:py-12 lg:px-24 lg:py-16 flex flex-col items-stretch sm:items-center md:items-start'>
          <Link
            to={`/`}
            className='md:hidden text-4xl font-serif font-semibold mb-4 text-center sm:text-left'
          >
            Креатур
          </Link>
          <div className='space-x-10 text-center sm:text-left'>
            <NavLink
              to={{
                pathname: `/login`,
                search: searchParams.toString(),
              }}
              className={({ isActive, isPending }) =>
                `${
                  isActive || isPending
                    ? "border-b-2 border-blue-500"
                    : "text-gray-500"
                } px-1 py-0.5 transition-colors hover:text-black`
              }
            >
              Вход
            </NavLink>
            <NavLink
              to={{
                pathname: `/register`,
                search: searchParams.toString(),
              }}
              className={({ isActive, isPending }) =>
                `${
                  isActive || isPending
                    ? "border-b-2 border-blue-500"
                    : "text-gray-500"
                } px-1 py-0.5 transition-colors hover:text-black`
              }
            >
              Регистрация
            </NavLink>
          </div>
          <Outlet />
        </div>
      </div>
      <div className='hidden flex-1 bg-[url("/images/auth-bg.webp")] bg-cover bg-center md:block'>
        <div className='lg:px-24 lg:py-16 text-right md:px-12 md:py-12'>
          <Link
            to={`/`}
            className='font-serif text-5xl lg:text-6xl font-bold text-white hover:text-blue-500 transition-colors'
          >
            Креатур
          </Link>
          <p className='mt-16 text-3xl/normal lg:text-4xl/normal tracking-widest text-white'>
            Отдыхай <br />
            креативно <br />
            вместе с <br />
            нами
          </p>
        </div>
      </div>
    </div>
  );
}
