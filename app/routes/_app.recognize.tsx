import type { Route } from "./+types/_app.recognize";

import clsx from "clsx";
import { ImageDownIcon, ImageUpIcon, LoaderCircleIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { data, href, redirect, useFetcher } from "react-router";

import LayoutWrapper from "~/components/LayoutWrapper";
import { db } from "~/utils/db.server";
import { dHash, hammingDistance } from "~/utils/hamming-distance.server";

export const action = async ({ request }: Route.ActionArgs) => {
	const formData = await request.formData();
	const file = formData.get("file");

	if (!(file instanceof File)) {
		return data(
			{
				success: false,
				place: undefined,
				products: undefined,
				detail: "Переданы некорректные данные.",
			},
			400,
		);
	}

	const imageDhash = await dHash(await file.bytes());

	const places = await db.place.findMany({
		include: {
			media: {
				where: {
					dhash: { not: null },
				},
			},
		},
	});
	const products = await db.product.findMany({
		where: { active: true },
		include: {
			route: true,
			media: {
				where: {
					dhash: { not: null },
				},
			},
		},
	});

	const placesDhashes = places.flatMap((place) => {
		const mediaDhashes = place.media.flatMap((media) =>
			media.dhash ? [{ placeId: place.id, dhash: media.dhash }] : [],
		);
		return place.imageDhash
			? [{ placeId: place.id, dhash: place.imageDhash }, ...mediaDhashes]
			: mediaDhashes;
	});
	const productsDhashes = products.flatMap((product) => {
		const placeId = product.route.at(0)?.placeId;
		if (!placeId) {
			return [];
		}

		const mediaDhashes = product.media.flatMap((media) =>
			media.dhash ? [{ placeId: placeId, dhash: media.dhash }] : [],
		);
		return product.imageDhash
			? [{ placeId: placeId, dhash: product.imageDhash }, ...mediaDhashes]
			: mediaDhashes;
	});
	const hammingDistances = [...placesDhashes, ...productsDhashes]
		.map((dhashItem) => ({
			...dhashItem,
			distance: hammingDistance(dhashItem.dhash, imageDhash),
		}))
		.filter((item) => item.distance < 10)
		.sort((a, b) => a.distance - b.distance);

	const bestMatch = hammingDistances.at(0);
	if (!bestMatch) {
		return data(
			{
				success: false,
				place: undefined,
				products: undefined,
				detail: "Не удалось распознать объект. Пожалуйста, попробуйте другое изображение.",
			},
			400,
		);
	}

	return redirect(href("/places/:placeId", { placeId: bestMatch.placeId }));
};

export default function RecognizePage() {
	const fetcher = useFetcher<typeof action>();

	const fileDropHandle = ([file]: File[]) => {
		if (file && fetcher.state === "idle") {
			const formData = new FormData();
			formData.set("file", file);
			fetcher.submit(formData, { method: "POST", encType: "multipart/form-data" });
		}
	};

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: fileDropHandle,
		accept: {
			"image/png": [".png"],
			"image/jpeg": [".jpg", ".jpeg"],
			"image/webp": [".webp"],
		},
		maxFiles: 1,
	});

	const pending = fetcher.state !== "idle";
	const error = fetcher.data?.success === false && fetcher.data.detail;

	return (
		<LayoutWrapper className="space-y-2 px-5">
			<p className="font-medium font-serif text-3xl md:px-0">Поиск объекта по фото</p>

			<fetcher.Form
				method="POST"
				encType="multipart/form-data"
				onChange={(event) => {
					event.currentTarget.requestSubmit();
				}}
			>
				{pending ? (
					<div className="grid h-96 place-items-center rounded-xl border-4 border-transparent bg-input/50">
						<LoaderCircleIcon className="size-16 animate-spin text-primary" />
					</div>
				) : null}

				{!pending && !fetcher.data?.success ? (
					<div
						{...getRootProps()}
						className={clsx(
							"grid h-96 w-full place-items-center rounded-xl border-4 border-dashed bg-input transition-colors hover:bg-primary/10",
							isDragActive ? "border-primary" : "border-muted-foreground",
						)}
					>
						<input name="file" {...getInputProps()} required />
						<div
							className={clsx(
								"flex flex-col items-center px-10",
								isDragActive ? "text-primary" : "text-muted-foreground",
							)}
						>
							{isDragActive ? (
								<>
									<ImageDownIcon className="size-16" />
									<p className="text-center">Отпустите изображение здесь для поиска</p>
								</>
							) : (
								<>
									<ImageUpIcon className="size-16" />
									<p className="text-center">
										Перетащите ваше изображение, или нажмите для выбора
									</p>
								</>
							)}
						</div>
					</div>
				) : null}
			</fetcher.Form>
			{!pending && error ? <p className="text-destructive">{error}</p> : null}
		</LayoutWrapper>
	);
}
