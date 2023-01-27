import React from "react";
import { NavLink } from "react-router-dom";
import ChevronDownIcon from "./icons/ChevronDownIcon";

export default function NavigationSubMenu({
  subtitle,
  children,
  linkTo,
}: {
  subtitle: string;
  children: React.ReactNode;
  linkTo?: string;
}) {
  const subtitleContent = (
    <span className="flex items-center">
      {subtitle}
      <span className="-mr-1 self-end pl-1 font-normal text-slate-500">
        <ChevronDownIcon type="mini" />
      </span>
    </span>
  );

  return (
    <div className="nav-sub relative">
      {linkTo ? (
        <NavLink
          to={linkTo}
          className="nav-sub-subtitle block py-2 text-slate-500 hover:text-blue-600 hover:underline md:cursor-pointer md:px-3"
          style={({ isActive }) =>
            isActive
              ? {
                  color: "black",
                  fontWeight: "600",
                }
              : undefined
          }
        >
          {subtitleContent}
        </NavLink>
      ) : (
        <p className="nav-sub-subtitle block py-2 text-slate-500 md:cursor-pointer md:px-3">
          {subtitleContent}
        </p>
      )}

      <div className="nav-sub-menu white rounded bg-white px-4 md:absolute md:-left-2 md:hidden md:w-max md:p-2 md:shadow-lg">
        {children}
      </div>
    </div>
  );
}
