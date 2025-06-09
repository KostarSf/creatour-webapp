import { Placemark, Map as YMap, YMaps } from "@pbe/react-yandex-maps";
import clsx from "clsx";
import { Form, Link, data, href, useLoaderData } from "react-router";

import type { Comment, Media, Place, Product, Rating, RoutePoint, Tag, User } from "@prisma-app/client";
import CommentItem from "~/components/CommentItem";
import LayoutWrapper from "~/components/LayoutWrapper";
import RatingBar from "~/components/RatingBar";
import { Button, buttonVariants } from "~/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import type { CustomHeaderHandle } from "~/lib/hooks/use-custom-header";
import { USER_ROLES } from "~/lib/user-roles";
import { db } from "~/utils/db.server";
import { useOptionalUser } from "~/utils/user";
import { Header } from "~/widgets/header";
import { LikeProductButton } from "~/widgets/like-button";
import { ProductRating } from "~/widgets/product-rating";
import type { Route } from "./+types/route";

export const meta: Route.MetaFunction = ({ data }) => [{ title: `${data?.product.name ?? ""} | Креатур` }];

export const handle: CustomHeaderHandle = {
	customHeader: true,
};

export const loader = async ({ params }: Route.LoaderArgs) => {
	const product = await db.product.findUnique({
		where: { id: params.productId },
		include: {
			comments: {
				include: {
					user: true,
					media: true,
				},
			},
			media: {
				orderBy: {
					community: "asc",
				},
			},
			rating: true,
			route: {
				include: {
					place: true,
				},
				orderBy: {
					order: "asc",
				},
			},
			tags: true,
		},
	});

	if (!product) {
		throw data({}, { status: 404 });
	}

	const coordinates = product.coordinates
		? product.coordinates.split(",").map((c) => Number(c.trim()))
		: null;

	return { product, coordinates: coordinates ? [coordinates[0], coordinates[1]] : null };
};

export default function ProductPage() {
	const { product, coordinates } = useLoaderData<typeof loader>();

	return (
		<>
			<ProductHeader product={product} />

			<LayoutWrapper className="px-5 pt-6 md:pt-12">
				<div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-3">
					<div className="flex flex-wrap items-baseline gap-3">
						<p className="not-last:border-r-2 pr-3 font-semibold text-xl leading-none">
							О мероприятии
						</p>
						{product.beginDate ? (
							<p className="font-serif text-lg leading-none">{formatDate(product.beginDate)}</p>
						) : null}
					</div>
					<div className="flex flex-1 justify-end">
						<ProductRating rating={product.rating} productId={product.id} className="py-0.5" />
					</div>
				</div>

				<p className="mt-5 whitespace-pre-line">{product.description}</p>

				<p className="mt-12 font-semibold text-xl leading-none">Адрес</p>
				{coordinates ? (
					<div className="mt-5 overflow-hidden rounded-xl bg-secondary">
						<YMaps query={{ apikey: "ea2f1a91-b606-4692-ae42-b82c4f60899e" }}>
							<YMap state={{ center: coordinates, zoom: 15 }} height={"400px"}>
								<Placemark geometry={coordinates} />
							</YMap>
						</YMaps>
					</div>
				) : null}
				<p className="mt-5">{product.address}</p>

				<p className="mt-12 font-semibold font-serif text-xl">Галерея изображений</p>
			</LayoutWrapper>

			<div className="-mx-6 my-6 md:mx-0 md:my-12">
				<div className="flex snap-x scroll-p-6 gap-6 overflow-x-auto px-6">
					{product.image && <AlbumImage link={`/api/uploads/products/${product.image}`} />}
					{product.media.map((image) => (
						<AlbumImage
							link={`/api/uploads${image.url}`}
							key={image.id}
							community={image.community}
						/>
					))}
				</div>
			</div>

			<div className="mx-auto max-w-6xl px-5 md:px-10">
				{product.route.length > 0 && (
					<>
						<p className="mt-24 font-semibold font-serif text-xl">Места мероприятия</p>
						<div className="my-3">
							{product.route.map((point) => (
								<Link
									key={point.id}
									to={href("/places/:placeId", { placeId: point.place.id })}
									className="flex items-center gap-3"
								>
									<div className="h-12 w-16 overflow-hidden rounded-lg bg-slate-300">
										{point.place.image && (
											<img
												src={`/api/uploads/places/${point.place.image}?w=200&f=avif`}
												className="aspect-square w-24 rounded-md object-cover"
												alt={point.place.image}
											/>
										)}
									</div>

									<div>
										<p className="font-medium text-blue-500 text-lg/normal">
											{point.place.name}
										</p>
										<p className="text-slate-600">{point.place.short}</p>
									</div>
								</Link>
							))}
						</div>
					</>
				)}

				<CommentsBlock product={product} />
			</div>
		</>
	);
}

interface ProductHeaderProps {
	product: Product & { tags: Tag[]; route: (RoutePoint & { place: Place })[] };
}

function ProductHeader({ product }: ProductHeaderProps) {
	const user = useOptionalUser();

	const buyed = !!user && user.activeProducts.findIndex((p) => p.id === product.id) !== -1;
	const canBuy = (!!user && user.role === USER_ROLES.user.key) || false;

	return (
		<div className="relative md:h-[800px]">
			<img
				src={
					product.image
						? `/api/uploads/products/${product.image}?w=2000&f=avif`
						: "/images/no-image.webp"
				}
				alt={product.name}
				className="-z-10 absolute top-0 left-0 h-full w-full object-cover object-center"
			/>
			<div className={clsx("h-full bg-black/40 pb-5 md:pb-16", !product.image && "backdrop-blur-sm")}>
				<LayoutWrapper className="flex h-full max-w-[100rem] flex-col justify-end gap-4 px-5 pt-32">
					<Header className="absolute top-0 left-0 w-full text-white" />
					<div className="flex flex-wrap gap-x-3 gap-y-2">
						{product.tags.map((tag) => (
							<Link
								key={tag.id}
								to={{
									pathname: href("/products"),
									search: `?tags=${tag.id}`,
								}}
								className="text-white leading-tight hover:underline sm:text-lg"
							>
								#{tag.name}
							</Link>
						))}
					</div>
					<h1 className="font-medium font-serif text-3xl text-white md:text-5xl xl:text-6xl">
						{product.name}
					</h1>

					{product.route.length === 0 ? (
						<p className="text-white">{product.short}</p>
					) : (
						<div className="flex flex-wrap gap-2">
							{product.route.map((routeItem) => (
								<p
									key={routeItem.id}
									className="border-r-2 pr-2 text-lg text-white leading-none last-of-type:border-r-0"
								>
									{routeItem.place.name}
								</p>
							))}
						</div>
					)}

					<div className="flex gap-3">
						<Form
							method="POST"
							action="/products?index"
							onSubmit={(e) => {
								if (
									!confirm(
										product.price > 0
											? `Приобрести за ${product.price} ₽?`
											: "Записаться бесплатно?",
									)
								) {
									e.preventDefault();
								}
							}}
							preventScrollReset
						>
							<input type="hidden" name="userId" value={user?.id} />
							<input type="hidden" name="productId" value={product.id} />
							<input type="hidden" name="redirectTo" value={`/products/${product.id}`} />
							<div className="flex flex-wrap items-center gap-2">
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
										: product.price === 0
											? "Бесплатно"
											: `${product.price.toLocaleString("ru")} ₽`}
								</Button>
								{!user ? (
									<Link
										to={{
											pathname: href("/login"),
											search: `?redirectTo=${href("/products/:productId", { productId: product.id })}`,
										}}
										className={buttonVariants({ variant: "default" })}
									>
										Войдите, чтобы приобрести!
									</Link>
								) : null}
							</div>
						</Form>
						<LikeProductButton productId={product.id} className="bg-background" />
					</div>
				</LayoutWrapper>
			</div>
		</div>
	);
}

function AlbumImage({
	link,
	community,
}: {
	link: string;
	community?: boolean;
}) {
	return (
		<div className="relative aspect-square w-[95%] shrink-0 snap-center overflow-hidden rounded-lg md:aspect-4/3 md:h-[50vh] md:w-auto">
			<img src={`${link}?w=1000&f=avif`} alt={link} className="h-full w-full object-cover" />
			{community && (
				<p className="absolute top-0 left-0 m-1 rounded-sm bg-white p-2 px-3 py-1 font-medium">
					Коммьюнити
				</p>
			)}
		</div>
	);
}

const PaperClipIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
		role="graphics-symbol"
		className={clsx(className || "h-6 w-6")}
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
		/>
	</svg>
);

function formatDate(date: Date) {
	const options: Intl.DateTimeFormatOptions = {
		year: undefined,
		month: "long",
		day: "numeric",
		weekday: "long",
		hour: "numeric",
		minute: "numeric",
	};

	const formatter = new Intl.DateTimeFormat("ru-RU", options);
	return formatter.format(date);
}

interface CommentsBlockProps {
	product: Product & {
		comments: (Comment & {
			user: User;
			media: Media[];
		})[];
		rating: Rating[];
	};
}

function CommentsBlock({ product }: CommentsBlockProps) {
	const user = useOptionalUser();

	return (
		<>
			<p className="mt-24 mb-6 font-semibold font-serif text-xl">Комментарии</p>
			<div className="space-y-6">
				{product.comments.map((comment) => (
					<CommentItem key={comment.id} comment={comment} rating={product.rating} />
				))}
			</div>
			<div className="mt-24 mb-12">
				{user ? (
					<Form
						method="POST"
						action={href("/api/add-comment")}
						encType="multipart/form-data"
						preventScrollReset
						className=" max-w-3xl"
					>
						<input type="hidden" name="redirectTo" value={`/products/${product.id}`} />
						<input type="hidden" name="parentType" value="product" />
						<input type="hidden" name="parentId" value={product.id} />
						<input type="hidden" name="userId" value={user.id} />
						<Textarea name="text" placeholder="Напишите свой отзыв!" required />
						<div className="mt-2 flex items-baseline justify-between gap-2">
							{/* <div className="flex-1"></div> */}
							<Label className="whitespace-nowrap" htmlFor="media-picker">
								Прекрепить файл:
							</Label>
							<Input
								type="file"
								name="media"
								id="media-picker"
								accept=".png,.jpg,.jpeg,.webp"
								multiple
								className="border-0 shadow-none"
							/>
							{/* <label htmlFor='media-picker' className="cursor-pointer hover:bg-gray-200 transition-colors rounded-sm text-gray-500 p-2">
                <PaperClipIcon/>
              </label> */}
							<Button type="submit" variant="secondary">
								Отправить
							</Button>
						</div>
					</Form>
				) : (
					<p className="text-center text-slate-500">Войдите, чтобы оставить комментарий</p>
				)}
			</div>
		</>
	);
}
