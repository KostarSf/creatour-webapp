import type { Route } from "./+types/api.uploads.$storageName.$fileKey";

import { redirect } from "react-router";

import { avatarsFileStorage, mediaFileStorage, productsFileStorage } from "~/utils/storage.server";

export const loader = async ({ params }: Route.LoaderArgs) => {
	if (params.storageName === "media") {
		const file = await mediaFileStorage.get(params.fileKey as string);

		if (file) {
			return new Response(file.stream(), {
				headers: {
					"Content-Type": file.type,
					"Content-Disposition": `attachment; filename=${file.name}`,
				},
			});
		}
	}

	if (params.storageName === "products") {
		const file = await productsFileStorage.get(params.fileKey as string);

		if (file) {
			return new Response(file.stream(), {
				headers: {
					"Content-Type": file.type,
					"Content-Disposition": `attachment; filename=${file.name}`,
				},
			});
		}
	}

	if (params.storageName === "avatars") {
		const file = await avatarsFileStorage.get(params.fileKey as string);

		if (file) {
			return new Response(file.stream(), {
				headers: {
					"Content-Type": file.type,
					"Content-Disposition": `attachment; filename=${file.name}`,
				},
			});
		}
	}

	if (params.storageName === "media") {
		return redirect(`/media/${params.fileKey}`);
	}

	return redirect(`/images/${params.storageName}/${params.fileKey}`);
};
