import { Link } from "@remix-run/react";
import React from "react";
import HeaderMobileMenu from "./HeaderMobileMenu";
import HeaderNavigation from "./HeaderNavigation";
import SearchBlock from "./SearchBlock";

export default function AppLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="relative flex min-h-full flex-col">
      <Header />
      <Main>{children}</Main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="items-center gap-4 md:flex md:justify-between">
          <div className="flex h-14 items-center justify-between lg:h-16">
            <Link
              to="/"
              className="flex items-center font-medium hover:text-blue-600"
            >
              <h1 className="text-md lg:text-xl">
                <span className="block">Креатур</span>
              </h1>
            </Link>
            <div className="md:hidden">
              <HeaderMobileMenu />
            </div>
          </div>
          <div className="hidden md:flex md:flex-row md:items-baseline md:gap-2">
            <HeaderNavigation />
            <div className="flex-1 lg:flex-initial">
              <SearchBlock />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Main({ children }: React.PropsWithChildren) {
  return (
    <main className="flex-grow">
      <div className="mx-auto max-w-7xl">{children}</div>
    </main>
  );
}

function Footer() {
  return (
    <footer className="mt-8 px-2 py-8 md:pb-2">
      <div className="text-center text-sm text-slate-500">
        © 2022-2023 | ООО Креатур
      </div>
    </footer>
  );
}
