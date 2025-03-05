import type { User } from "@prisma/client";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { UploadAvatarAction } from "~/routes/api.upload-avatar";
import { InfoField } from "./InfoField";
import { NoImageIcon } from "./NoImageIcon";

type Props = {
	user: User;
};

export default function ServiceUserCard({ user }: Props) {
	const [changingInfo, setChangingInfo] = useState(false);

	const fetcher = useFetcher<UploadAvatarAction>();

	useEffect(() => {
		if (fetcher.data?.error) {
			alert(fetcher.data.error);
		} else {
			setChangingInfo(false);
		}
	}, [fetcher.data]);

	const submitAvatar = (files: FileList | null) => {
		if (files) {
			console.log(files[0]);
			const formData = new FormData();
			formData.append("userId", user.id);
			formData.append("avatar", files[0]);
			fetcher.submit(formData, {
				method: "POST",
				action: "/api/upload-avatar",
				encType: "multipart/form-data",
			});
		} else {
			console.log("No image selected");
		}
	};

	return (
		<fetcher.Form
			method="POST"
			className="-mx-6 my-6 max-w-7xl border p-6 shadow-blue-900/5 shadow-lg md:mx-auto md:my-12 md:rounded-lg"
		>
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-4">
					<div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-slate-400 transition-colors hover:bg-slate-300">
						<label
							htmlFor="avatar-input"
							className="block h-full w-full cursor-pointer"
						>
							<input
								type="file"
								name="avatar"
								accept="image/*"
								className="sr-only"
								id="avatar-input"
								onChange={(e) => submitAvatar(e.target.files)}
							/>
						</label>
						<div className="pointer-events-none absolute inset-0 grid place-items-center">
							{user.avatar ? (
								<img
									src={user.avatar}
									alt="avatar"
									className="h-full w-full object-cover"
								/>
							) : (
								<NoImageIcon className="h-8 w-8 text-slate-100" />
							)}
						</div>
					</div>
					<div>
						<p className="font-bold font-serif text-xl/none">{user.username}</p>
						<p>ID {user.id.split("-")[0].toUpperCase()}</p>
					</div>
				</div>
				<button
					onClick={() => setChangingInfo(true)}
					type="button"
					className={clsx(
						"px-4 py-1 font-medium text-blue-500 uppercase hover:underline",
						changingInfo && "hidden",
					)}
				>
					Изменить
				</button>
				<button
					type="submit"
					name="intent"
					value="change-info"
					className={clsx(
						"rounded bg-blue-50 px-4 py-1 font-medium text-blue-500 uppercase transition-colors hover:bg-blue-100",
						!changingInfo && "hidden",
					)}
				>
					Сохранить
				</button>
			</div>
			<div className="mt-6 flex flex-col gap-3 md:pl-16 lg:flex-row">
				<div className="space-y-3">
					<InfoField
						type="text"
						disabled={!changingInfo}
						label="Город"
						name="city"
						defaultValue={user.city || ""}
					/>
					<InfoField
						type="text"
						editable={false}
						label="E-mail"
						name="email"
						defaultValue={user.email || ""}
					/>
					<InfoField
						type="text"
						disabled={!changingInfo}
						label="Телефон"
						name="phone"
						defaultValue={user.phone || ""}
					/>
				</div>
				<div className="flex-1 space-y-3">
					<InfoField
						type="text"
						disabled={!changingInfo}
						label="Юр. имя"
						name="legalName"
						defaultValue={user.legalName || ""}
					/>
					<InfoField
						type="text"
						disabled={!changingInfo}
						label="ИНН"
						name="inn"
						defaultValue={user.inn || ""}
					/>
					<InfoField
						type="text"
						disabled={!changingInfo}
						label="Адрес"
						name="address"
						defaultValue={user.address || ""}
					/>
				</div>
			</div>
		</fetcher.Form>
	);
}
