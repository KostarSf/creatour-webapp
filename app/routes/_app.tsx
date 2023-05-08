import { Form, Link, Outlet } from "@remix-run/react";
import { useOptionalUser } from "~/utils/user";

export default function AppLayout() {
  const user = useOptionalUser();

  return (
    <div className='px-6 md:px-16 lg:px-32 pt-3 md:pt-6 pb-24 m-auto'>
      <div className='flex justify-between items-baseline mb-6 md:mb-12'>
        <Link to='/' className='font-serif text-xl font-bold tracking-wider transition-colors hover:text-blue-500'>
          Креатур
        </Link>
        {user ? (
          <Link to='/user' className='block hover:underline'>
            ID {user.id.split("-")[0].toUpperCase()}
          </Link>
        ) : null}
        <Form method='post' action='/logout'>
          <button type='submit' className="hover:underline">Выход</button>
        </Form>
      </div>
      <Outlet />
    </div>
  );
}
