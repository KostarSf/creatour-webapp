import { NavLink } from "@remix-run/react";

export default function NavigationLink({
  url,
  title,
  onClick,
  activeStyling = true,
}: {
  url: string;
  title: string;
  onClick?: VoidFunction;
  activeStyling?: boolean;
}) {
  return (
    <NavLink
      to={url}
      className="block py-2 text-slate-500 hover:text-blue-600 hover:underline md:px-3"
      style={({ isActive }) =>
        isActive && activeStyling
          ? {
              color: "black",
              fontWeight: "600",
            }
          : undefined
      }
      onClick={onClick}
      end
    >
      {title}
    </NavLink>
  );
}
