import clsx from "clsx";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { data } from "react-router";
import { Form, useLoaderData } from "react-router";
import invariant from "tiny-invariant";
import CardDate from "~/components/CardDate";
import CommentItem from "~/components/CommentItem";
import RatingBar from "~/components/RatingBar";
import { db } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => [
	{ title: `${data?.product.name ?? ""} | Креатур` },
];

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	invariant(params.productId, "productId must be set");

	const userId = await getUserId(request);
	const user = userId
		? await db.user.findUnique({
				where: { id: userId },
				select: {
					id: true,
					role: true,
					activeProducts: {
						select: {
							id: true,
						},
					},
				},
			})
		: null;

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
		},
	});

	if (!product) {
		throw data({}, { status: 404 });
	}

	return { product, user };
};

export default function ProductPage() {
	const { product, user } = useLoaderData<typeof loader>();

	const buyed =
		user?.activeProducts.findIndex((p) => p.id === product.id) !== -1;

	const canBuy = user?.role === "user" || false;

	return (
		<>
			<div className="my-6 md:my-12">
				<h1 className="font-bold font-serif text-2xl">{product.name}</h1>
				<p className="mt-2">{product.short}</p>
				<div className="mt-6 flex items-center">
					<div className="flex-1 md:mr-12 md:flex-grow-0">
						<RatingBar ratings={product.rating} />
						<p className="text-slate-500">{product.rating.length} оценок</p>
					</div>
					{product.beginDate && (
						<CardDate date={product.beginDate} className="text-right" />
					)}
				</div>
			</div>

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
				className="my-12"
				preventScrollReset
			>
				<input type="hidden" name="userId" value={user?.id} />
				<input type="hidden" name="productId" value={product.id} />
				<input
					type="hidden"
					name="redirectTo"
					value={`/products/${product.id}`}
				/>
				<button
					type="submit"
					name="intent"
					value="activate-product"
					disabled={buyed || !canBuy}
					className={clsx(
						"rounded px-6 py-2 font-medium uppercase transition-colors",
						canBuy
							? !buyed
								? "bg-blue-100 text-blue-600 hover:bg-blue-200"
								: "bg-green-100 text-green-600"
							: "border border-blue-100 text-blue-600",
					)}
				>
					{buyed
						? "Приобретено"
						: product.price === 0
							? "Бесплатно"
							: `${product.price} ₽`}
				</button>
			</Form>

			<p className="font-semibold font-serif text-xl">Галерея изображений</p>
			<div className="-mx-6 md:-mx-12 my-6 md:my-12">
				<div className="flex snap-x scroll-p-6 gap-6 overflow-x-auto px-6">
					{product.image && (
						<AlbumImage link={`/images/products/${product.image}`} />
					)}
					{product.media.map((image) => (
						<AlbumImage
							link={image.url}
							key={image.id}
							community={image.community}
						/>
					))}
				</div>
			</div>

			{product.route.length > 0 && (
				<>
					<p className="mt-24 font-semibold font-serif text-xl">
						Места мероприятия
					</p>
					<div className="my-3">
						{product.route.map((point) => (
							<div key={point.id} className="flex items-center gap-3">
								<div className="h-12 w-16 overflow-hidden rounded-lg bg-slate-300">
									{point.place.image && (
										<img
											src={`/images/places/${point.place.image}`}
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
							</div>
						))}
					</div>
				</>
			)}

			{product.description && (
				<>
					<p className="mt-24 font-semibold font-serif text-xl">Описание</p>
					<p>{product.description}</p>
				</>
			)}

			<p className="mt-24 mb-6 font-semibold font-serif text-xl">Комментарии</p>
			<div className="space-y-6">
				{product.comments.map((comment) => (
					<CommentItem
						key={comment.id}
						comment={comment}
						rating={product.rating}
					/>
				))}
			</div>
			<div className="mt-24 mb-12">
				{user ? (
					<Form
						method="POST"
						action="/api/add-comment"
						encType="multipart/form-data"
						preventScrollReset
						className=" max-w-3xl"
					>
						<input
							type="hidden"
							name="redirectTo"
							value={`/products/${product.id}`}
						/>
						<input type="hidden" name="parentType" value="product" />
						<input type="hidden" name="parentId" value={product.id} />
						<input type="hidden" name="userId" value={user.id} />
						<textarea
							name="text"
							className="min-h-[5rem] w-full rounded border px-2 py-1"
							placeholder="Напишите свой отзыв!"
						/>
						<div className="mt-2 flex items-baseline justify-between gap-2">
							{/* <div className="flex-1"></div> */}
							<input
								type="file"
								name="media"
								id="media-picker"
								accept=".png,.jpg,.jpeg,.webp"
								multiple
							/>
							{/* <label htmlFor='media-picker' className="cursor-pointer hover:bg-gray-200 transition-colors rounded text-gray-500 p-2">
                <PaperClipIcon/>
              </label> */}
							<button
								type="submit"
								className="rounded bg-blue-100 px-4 py-2 font-medium text-blue-600 uppercase transition-colors hover:bg-blue-200"
							>
								Отправить
							</button>
						</div>
					</Form>
				) : (
					<p className="text-center text-slate-500">
						Войдите, чтобы оставить комментарий
					</p>
				)}
			</div>
		</>
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
		<div className="relative aspect-square w-[95%] shrink-0 snap-center overflow-hidden rounded-lg md:aspect-[4/3] md:h-[50vh] md:w-auto">
			<img src={link} alt={link} className="h-full w-full object-cover" />
			{community && (
				<p className="absolute top-0 left-0 m-1 rounded bg-white p-2 px-3 py-1 font-medium">
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
