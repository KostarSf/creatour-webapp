import type { Place, Product, RoutePoint } from "@prisma-app/client";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Form, Link } from "react-router";
import { USER_ROLES } from "~/lib/user-roles";
import { useOptionalUser } from "~/utils/user";
import { LikeProductButton } from "~/widgets/like-button";
import CardDate from "./CardDate";
import { AspectRatio } from "./ui/aspect-ratio";
import { Button, buttonVariants } from "./ui/button";
import { Card } from "./ui/card";

export function ProductCard<TType extends CardType>({ type, object, className }: CardProps<TType>) {
	const user = useOptionalUser();
	const buyed = user ? user.activeProducts.findIndex((p) => p.id === object.id) !== -1 : false;
	const canBuy = user ? user.role === USER_ROLES.user.key : false;

	return (
		<ProductCardBase
			className={className}
			footer={
				type === "product" ? (
					<>
						<div className="flex-1" />
						{type === "product" ? <LikeProductButton productId={object.id} /> : null}
						{user ? (
							<Form
								method="POST"
								onSubmit={(e) => {
									if (
										!confirm(
											object.price > 0
												? `Приобрести за ${object.price} ₽?`
												: "Записаться бесплатно?",
										)
									) {
										e.preventDefault();
									}
								}}
							>
								<input type="hidden" name="userId" value={user.id} />
								<input type="hidden" name="productId" value={object.id} />
								<Button
									type="submit"
									name="intent"
									value="activate-product"
									disabled={buyed || !canBuy}
									variant={buyed ? "default" : "outline"}
									className={clsx(buyed && "disabled:opacity-100")}
								>
									{buyed
										? "Приобретено"
										: object.price === 0
											? "Бесплатно"
											: `${object.price.toLocaleString("ru")} ₽`}
								</Button>
								{/* <button
									type="submit"
									name="intent"
									value="activate-product"
									disabled={buyed || !canBuy}
									className={clsx(
										"rounded-sm px-6 py-2 font-medium uppercase transition-colors",
										canBuy
											? !buyed
												? "bg-blue-100 text-blue-600 hover:bg-blue-200"
												: "bg-green-100 text-green-600"
											: "text-blue-600",
									)}
								>
									{buyed
										? "Приобретено"
										: object.price === 0
											? "Бесплатно"
											: `${object.price} ₽`}
								</button> */}
							</Form>
						) : null}
					</>
				) : null
			}
			type={type}
			object={object}
		/>
	);
}

export function ServiceProductCard<TType extends CardType>({
	type,
	object,
	usedIn,
	className,
}: CardProps<TType> & {
	usedIn?: RoutePoint &
		{
			product: Product;
		}[];
	className?: string;
}) {
	return (
		<ProductCardBase
			className={className}
			footer={
				<>
					{type === "product" ? (
						<Form method="POST">
							<input type="hidden" name={`${type}Id`} value={object.id} />
							<Button
								type="submit"
								name="intent"
								value={`${type}-active-toggle`}
								variant={object.active ? "default" : "secondary"}
							>
								{object.active ? "Активно" : "Неактивно"}
							</Button>
						</Form>
					) : (
						<div />
					)}
					<Link
						to={`/admin/${type}s/${object.id}/edit`}
						className={buttonVariants({ variant: "outline" })}
					>
						Изменить
					</Link>
				</>
			}
			topLeftText={type === "product" ? (object.price === 0 ? "Бесплатно" : `${object.price} ₽`) : ""}
			type={type}
			object={object}
		>
			{usedIn && usedIn.length > 0 ? (
				<>
					<p className="mt-6 font-medium text-lg">Используется в турпродуктах</p>
					{usedIn.map((point) => (
						<Link
							to={`/products/${point.product.id}`}
							key={point.product.id}
							className="text-blue-500 hover:underline"
						>
							{point.product.name}
						</Link>
					))}
				</>
			) : null}
		</ProductCardBase>
	);
}

type CardType = "place" | "product";

type CardProps<TType extends CardType> = { className?: string } & (TType extends "place"
	? {
			type: "place";
			object: Place;
		}
	: {
			type: "product";
			object: Product;
		});

type CardBaseProps<TType extends CardType> = CardProps<TType> & {
	topLeftText?: string;
	footer?: ReactNode;
	children?: ReactNode;
	className?: string;
};

function ProductCardBase<TType extends CardType>({
	type,
	object,
	topLeftText,
	footer,
	children,
	className,
}: CardBaseProps<TType>) {
	return (
		<Card className={clsx("overflow-hidden py-0", className)}>
			<div className="grid gap-5 lg:grid-cols-5">
				<Link to={`/${type}s/${object.id}`} className="relative lg:col-span-2">
					<div className="hidden lg:block">
						<AspectRatio ratio={16 / 9} className="bg-muted">
							<img
								src={
									object.image
										? `/api/uploads/${type}s/${object.image}`
										: "/images/no-image.webp"
								}
								alt={object.name}
								className="h-full w-full object-cover object-center"
							/>
						</AspectRatio>
					</div>
					<div className="absolute inset-0 lg:hidden">
						<img
							src={object.image ? `/images/${type}s/${object.image}` : "/images/no-image.webp"}
							alt={object.name}
							className="h-full w-full object-cover object-center"
						/>
					</div>
					<div className="flex min-h-48 flex-col justify-between text-white lg:absolute lg:inset-0 lg:min-h-auto">
						<div className="z-10 flex justify-between px-5 py-4">
							{type === "product" && (
								<>
									<div className="font-medium text-base/none uppercase">{topLeftText}</div>
									<div className="text-right">
										{object.beginDate ? <CardDate date={object.beginDate} /> : null}
									</div>
								</>
							)}
						</div>
						<div className="z-10 flex items-center justify-between bg-black/10 px-5 py-3 backdrop-blur-md">
							<p className="text-sm/none md:text-base/none">{object.address}</p>
							<img
								src="/images/landing/arrow_right.svg"
								alt="arrow_right.svg"
								className="inline px-2"
							/>
						</div>
					</div>
				</Link>
				<div className="flex flex-col gap-3 pr-5 pb-4 pl-5 lg:col-span-3 lg:pt-4 lg:pl-0">
					<div className="flex-1">
						<Link
							to={`/${type}s/${object.id}`}
							className="font-medium font-serif text-xl/none md:text-3xl"
						>
							{object.name}
						</Link>
						<p className="mt-2 text-slate-700">{object.short}</p>
						<div>{children}</div>
					</div>
					{footer && (
						<div className="flex flex-wrap items-center justify-between gap-2">{footer}</div>
					)}
				</div>
			</div>
		</Card>
	);
}
