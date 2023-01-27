import SearchIcon from "./icons/SearchIcon";

export default function SearchBlock({
  showButton = true,
}: {
  showButton?: boolean;
}) {
  return (
    <form action="/search" method="get">
      <div className="flex items-center">
        <input
          type="text"
          name="q"
          placeholder="Поиск..."
          className="w-full border-b-2 px-2 py-0.5 hover:border-slate-400 lg:w-48 lg:transition-all xl:focus:w-80"
        />
        {showButton ? (
          <button
            type="submit"
            aria-label="поиск"
            className="-mr-2 cursor-pointer p-2 text-slate-500 hover:text-black"
          >
            <SearchIcon type="mini" />
          </button>
        ) : null}
      </div>
    </form>
  );
}
