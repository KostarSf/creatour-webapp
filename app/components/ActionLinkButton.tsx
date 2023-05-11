import { Link } from "@remix-run/react";
import type { ReactNode } from "react";

type Props = {
  to: string,
  children?: ReactNode | ReactNode[]
}

export default function ActionLinkButton({to, children}: Props) {
  return (
    <Link
      to={to}
      className='text-lg uppercase bg-blue-100 text-blue-500 rounded font-medium hover:bg-blue-200 px-4 py-1'
    >
      {children}
    </Link>
  );
}
