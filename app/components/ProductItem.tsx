import { Link } from "@remix-run/react";
import { ProductType, ProductTypeToString } from "~/utils/dataTypes";
import { ProductTypeToLocalizedString } from "~/utils/dataTypes";

export default function ProjectItem({
  id,
  name,
  short,
  type,
  image,
}: {
  id: string;
  name: string;
  short: string;
  type: ProductType;
  image?: string;
}) {
  return (
    <Link to={`/${ProductTypeToString(type)}/${id}`} className="flex gap-2">
      <img
        src={`images/${image}`}
        alt={image}
        className="block h-14 w-24 shrink-0 rounded object-cover md:h-28 md:w-48"
      />
      <div>
        <h2 className="mb-3 text-2xl font-semibold leading-none hover:text-blue-600">
          {name}
        </h2>
        <p className="mb-2">{short}</p>
        <div className="flex flex-col justify-between sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold ">
              {ProductTypeToLocalizedString(type)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
