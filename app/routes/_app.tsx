import { Form, Link, Outlet } from "@remix-run/react";
import { useOptionalUser } from "~/utils/user";

export default function AppLayout() {
  const user = useOptionalUser();

  return (
    <div className='m-auto px-6 pb-24 pt-3 md:px-16 md:pt-6 lg:px-32'>
      <div className='mb-6 md:mb-12'>
        <div className='flex items-baseline justify-between'>
          <Link
            to='/'
            className='font-serif text-xl font-bold tracking-wider transition-colors hover:text-blue-500'
          >
            Креатур
          </Link>
          {user && (
            <Link to='/user' className='block hover:underline'>
              ID {user.id.split("-")[0].toUpperCase()}
            </Link>
          )}
          <div className='flex gap-2'>
            <Link
              to='/object-recognizer/index.html'
              reloadDocument
              className='text-blue-500 hover:underline hidden sm:block'
            >
              Распознать объект
            </Link>
            {user ? (
              <>
                <Form method='POST' action='/logout'>
                  <button type='submit' className='hover:underline'>
                    Выход
                  </button>
                </Form>
              </>
            ) : (
              <Link to='/login' className='hover:underline'>
                Вход
              </Link>
            )}
          </div>
        </div>
        <div className=''>
          <Link
            to='/object-recognizer/index.html'
            reloadDocument
            className='text-blue-500 hover:underline inline sm:hidden'
          >
            Распознать объект
          </Link>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
