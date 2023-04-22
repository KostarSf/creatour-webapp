import { Form, Link, NavLink } from "@remix-run/react";

export default function LoginRoute() {
  return (
    <div className='flex h-screen w-screen items-stretch'>
      <div className='flex-grow sm:flex-shrink-0 sm:flex-grow-0'>
        <div className='bg-white px-6 py-8 md:px-12 md:py-12 lg:px-24 lg:py-16'>
          <div className='space-x-10'>
            <NavLink
              to={`/login`}
              className={({ isActive }) =>
                `${
                  isActive ? "border-b-2 border-blue-500" : "text-gray-500"
                } px-1 py-0.5 transition-colors hover:text-black`
              }
            >
              Вход
            </NavLink>
            <NavLink
              to={`/register`}
              className={({ isActive }) =>
                `${
                  isActive ? "border-b-2 border-blue-500" : "text-gray-500"
                } px-1 py-0.5 transition-colors hover:text-black`
              }
            >
              Регистрация
            </NavLink>
          </div>
          <div className='my-16'>
            <p className='text-4xl/relaxed font-medium tracking-widest'>
              Мы скучали!
            </p>
            <p className='text-lg leading-relaxed text-gray-800'>
              Войдите, чтобы продолжить
            </p>
          </div>
          <Form method='POST'>
            <div className='group relative w-full rounded-md px-4 py-3 ring-1 ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 sm:w-96'>
              <input
                type='text'
                name='login'
                className='w-full outline-none'
                placeholder='Логин'
              />
            </div>
            <div className='group relative mt-2 w-full rounded-md px-4 py-3 ring-1 ring-gray-300 focus-within:ring-2 focus-within:ring-blue-500 sm:w-96'>
              <input
                type='text'
                name='password'
                className='w-full outline-none'
                placeholder='Пароль'
              />
            </div>
            <div className='mt-8 flex flex-wrap justify-between gap-2'>
              <div className='flex gap-2 align-middle'>
                <input type='checkbox' name='remember' id='remember' />
                <label htmlFor='remember'>Запомнить меня</label>
              </div>
              <Link
                to={`/forgot-password`}
                className='text-gray-500 hover:underline'
              >
                Забыли пароль?
              </Link>
            </div>
            <div className='mt-20'>
              <button
                type='submit'
                className='w-full rounded-md bg-blue-500 px-14 py-3 font-medium text-white transition-colors hover:bg-blue-600 sm:w-auto'
              >
                Войти
              </button>
            </div>
          </Form>
        </div>
      </div>
      <div className='hidden flex-1 bg-[url("/images/auth-bg.webp")] bg-cover bg-center md:block'>
        <div className='lg:px-24 lg:py-16 text-right md:px-12 md:py-12'>
          <h1 className='font-serif text-5xl lg:text-6xl font-bold text-white'>Креатур</h1>
          <p className='mt-16 text-3xl lg:text-4xl leading-normal tracking-widest text-white'>
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
