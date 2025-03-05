import type { Product } from "@prisma/client";
import clsx from "clsx";
import { Link } from "react-router";
import CardDate from "~/components/CardDate";

type Props = {
	product: Product;
	username: string;
	className?: string;
};

export default function NextEventBanner({
	product,
	username,
	className,
}: Props) {
	return (
		<Link
			to={`/products/${product.id}`}
			className={clsx("relative block h-72 bg-slate-200 lg:h-96", className)}
		>
			<div className="-mx-6 md:-mx-16 lg:-mx-32 relative h-full">
				<img
					src={`/images/products/${product.image}` || undefined}
					alt={product.image || "изображение отсутствует"}
					className="h-full w-full object-cover object-center"
				/>
				<div className="absolute inset-0 bg-black/50" />
			</div>

			<div className="absolute inset-0 flex flex-col justify-between py-3 text-white">
				<div className="flex justify-between">
					<p className="font-medium">
						{username.split(" ").shift()}, ваше ближайшее событие
					</p>
					{product.beginDate && (
						<CardDate date={product.beginDate} className="text-right" />
					)}
				</div>
				<p className="text-center font-semibold font-serif text-2xl lg:text-3xl">
					{product.name}
				</p>
				<p>{product.address}</p>
			</div>
		</Link>
	);
}
