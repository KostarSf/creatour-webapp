import { LocalFileStorage } from "@mjackson/file-storage/local";

export const avatarsFileStorage = new LocalFileStorage("./public/uploads/avatars");

export const mediaFileStorage = new LocalFileStorage("./public/uploads/media");

export const productsFileStorage = new LocalFileStorage("./public/uploads/products");

export function getProductsStorageKey(productId: string, filename: string) {
	return `${productId}.${filename.split(".").pop()}`;
}

export const placesFileStorage = new LocalFileStorage("./public/uploads/places");

export function getPlacesStorageKey(placeId: string, filename: string) {
	return `${placeId}.${filename.split(".").pop()}`;
}

export const thumbnailsFileStorage = new LocalFileStorage("./public/uploads/thumbnails");

export function getThumbnailStorageKey(
	originalKey: string,
	{ w, f, q }: { w?: number; f?: string; q?: number },
) {
	const parts = [originalKey];
	if (w) parts.push(`w${w}`);
	if (f) parts.push(`f${f}`);
	if (q) parts.push(`q${q}`);
	return parts.join("_");
}
