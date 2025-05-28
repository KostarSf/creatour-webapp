import type { Route } from "./+types/api.uploads.$storageName.$fileKey";

import { redirect } from "react-router";

import sharp from "sharp";
import {
	avatarsFileStorage,
	mediaFileStorage,
	placesFileStorage,
	productsFileStorage,
} from "~/utils/storage.server";
import { getThumbnailStorageKey, thumbnailsFileStorage } from "~/utils/storage.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
	const url = new URL(request.url);
	const w = url.searchParams.get("w") ? Number(url.searchParams.get("w")) : undefined;
	const f = url.searchParams.get("f") || undefined;
	const q = url.searchParams.get("q") ? Number(url.searchParams.get("q")) : undefined;

	let fileStorage:
		| typeof mediaFileStorage
		| typeof productsFileStorage
		| typeof placesFileStorage
		| typeof avatarsFileStorage
		| undefined;
	if (params.storageName === "media") fileStorage = mediaFileStorage;
	else if (params.storageName === "products") fileStorage = productsFileStorage;
	else if (params.storageName === "avatars") fileStorage = avatarsFileStorage;
	else if (params.storageName === "places") fileStorage = placesFileStorage;

	if (fileStorage) {
		const file = await fileStorage.get(params.fileKey as string);
		if (!file) {
			if (params.storageName === "media") {
				return redirect(`/media/${params.fileKey}`);
			}
			return redirect(`/images/${params.storageName}/${params.fileKey}`);
		}

		const isImage = file.type.startsWith("image/");
		if (isImage && (w || f || q)) {
			const thumbKey = getThumbnailStorageKey(params.fileKey as string, { w, f, q });
			const thumb = await thumbnailsFileStorage.get(thumbKey);
			if (thumb) {
				return new Response(thumb.stream(), {
					headers: {
						"Content-Type": thumb.type,
						"Cache-Control": "public, max-age=60",
					},
				});
			}

			// Generate thumbnail
			let transformer = sharp(Buffer.from(await file.arrayBuffer()));
			if (w) transformer = transformer.resize({ width: w });
			let format = f || file.type.split("/")[1];
			if (["jpeg", "jpg", "webp", "avif"].includes(format)) {
				if (format === "jpg") format = "jpeg";
				transformer = transformer.toFormat(format as keyof sharp.FormatEnum, { quality: q || 80 });
			}
			const outputBuffer = await transformer.toBuffer();
			const mimeType = `image/${format}`;
			const thumbFile = new File([outputBuffer], thumbKey, { type: mimeType });
			await thumbnailsFileStorage.set(thumbKey, thumbFile);
			return new Response(outputBuffer, {
				headers: {
					"Content-Type": mimeType,
					"Cache-Control": "public, max-age=60",
				},
			});
		}

		return new Response(file.stream(), {
			headers: {
				"Content-Type": file.type,
				"Cache-Control": "public, max-age=60",
			},
		});
	}

	return redirect(`/images/${params.storageName}/${params.fileKey}`);
};
