import type { LoaderFunctionArgs } from "react-router";
import { avatarsFileStorage } from "~/utils/storage.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
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

	throw new Response("Upload file not found", {
		status: 404,
	});
};
