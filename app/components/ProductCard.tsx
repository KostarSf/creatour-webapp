import type { Place, Product, RoutePoint } from "@prisma/client";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Form, Link } from "react-router";
import CardDate from "./CardDate";
import { NoImageIcon } from "./NoImageIcon";

export function ProductCard<TType extends CardType>({
	type,
	object,
	buyed,
	userId,
	canBuy,
}: CardProps<TType> & {
	buyed?: boolean;
	userId?: string;
	canBuy: boolean;
}) {
	return (
		<ProductCardBase
			footer={
				type === "product" ? (
					<>
						<div />
						{userId ? (
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
								<input type="hidden" name="userId" value={userId} />
								<input type="hidden" name="productId" value={object.id} />
								<button
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
								</button>
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
}: CardProps<TType> & {
	usedIn?: RoutePoint &
		{
			product: Product;
		}[];
}) {
	return (
		<ProductCardBase
			footer={
				<>
					{type === "product" ? (
						<Form method="POST">
							<input type="hidden" name={`${type}Id`} value={object.id} />
							<button
								type="submit"
								name="intent"
								value={`${type}-active-toggle`}
								className={clsx(
									"rounded-sm px-6 py-2 font-medium uppercase transition-colors",
									object.active
										? "bg-green-100 text-green-600 hover:bg-green-200"
										: "bg-gray-100 text-gray-600 hover:bg-gray-200",
								)}
							>
								{object.active ? "Активно" : "Неактивно"}
							</button>
						</Form>
					) : (
						<div />
					)}
					<Link
						to={`/admin/${type}s/${object.id}/edit`}
						className="rounded-sm px-6 py-2 font-medium text-blue-600 uppercase transition-colors hover:bg-blue-100"
					>
						Изменить
					</Link>
				</>
			}
			topLeftText={
				type === "product"
					? object.price === 0
						? "Бесплатно"
						: `${object.price} ₽`
					: ""
			}
			type={type}
			object={object}
		>
			{usedIn && usedIn.length > 0 ? (
				<>
					<p className="mt-6 font-medium text-lg">
						Используется в турпродуктах
					</p>
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

type CardProps<TType extends CardType> = TType extends "place"
	? {
			type: "place";
			object: Place;
		}
	: {
			type: "product";
			object: Product;
		};

type CardBaseProps<TType extends CardType> = CardProps<TType> & {
	topLeftText?: string;
	footer?: ReactNode;
	children?: ReactNode;
};

function ProductCardBase<TType extends CardType>({
	type,
	object,
	topLeftText,
	footer,
	children,
}: CardBaseProps<TType>) {
	return (
		<div className="flex flex-col overflow-hidden px-6 shadow-sm md:rounded-sm md:px-0 lg:flex-row lg:items-stretch">
			<Link
				to={`/${type}s/${object.id}`}
				className="-mx-6 relative block h-48 shrink-0 overflow-hidden bg-slate-300 text-white md:mx-0 md:rounded-sm lg:h-auto lg:w-[40%]"
			>
				{object.image ? (
					<div className="absolute inset-0">
						<img
							src={`/images/${type}s/${object.image}`}
							alt={object.name}
							className="h-full w-full object-cover object-center"
						/>
					</div>
				) : (
					<div className="grid h-full w-full place-items-center">
						<NoImageIcon className="h-32 w-32 text-slate-100" />
					</div>
				)}
				<div className="absolute inset-0 flex flex-col justify-between bg-black/10 p-6">
					<div className="flex justify-between">
						{type === "product" && (
							<>
								<div className="font-medium text-base/none uppercase">
									{topLeftText}
								</div>
								<div className="text-right">
									{object.beginDate ? (
										<CardDate date={object.beginDate} />
									) : null}
								</div>
							</>
						)}
					</div>
					<div className="flex items-center justify-between">
						<p className="text-base/none">{object.address}</p>
						<img
							src="/images/landing/arrow_right.svg"
							alt="arrow_right.svg"
							className="inline px-2"
						/>
					</div>
				</div>
			</Link>
			<div className="flex flex-1 flex-col gap-12 pt-3 pb-6 md:px-6 lg:min-h-[12rem]">
				<div className="flex-1">
					<Link
						to={`/${type}s/${object.id}`}
						className="font-bold font-serif text-2xl md:text-3xl"
					>
						{object.name}
					</Link>
					<p className="text-lg text-slate-700">{object.short}</p>
					<div>{children}</div>
				</div>
				{footer && (
					<div className="flex flex-wrap items-center justify-between gap-2">
						{footer}
					</div>
				)}
			</div>
		</div>
	);
}
