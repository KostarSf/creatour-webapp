import type { User } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { InfoField } from "./InfoField";
import { NoImageIcon } from "./NoImageIcon";

type Props = {
	user: User;
};

export default function ServiceUserCard({ user }: Props) {
	const [changingInfo, setChangingInfo] = useState(false);

	const fetcher = useFetcher();

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
			className="my-6 md:my-12 border shadow-lg shadow-blue-900/5 p-6 -mx-6 md:mx-auto md:rounded-lg max-w-7xl"
		>
			<div className="flex justify-between items-start">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 rounded-full overflow-hidden bg-slate-400 hover:bg-slate-300 transition-colors flex-shrink-0 relative">
						<input
							type="file"
							name="avatar"
							accept="image/*"
							className="sr-only"
							id="avatar-input"
							onChange={(e) => submitAvatar(e.target.files)}
						/>
						<label
							htmlFor="avatar-input"
							className="w-full h-full block cursor-pointer"
						></label>
						<div className="absolute inset-0 grid place-items-center pointer-events-none">
							{user.avatar ? (
								<img
									src={user.avatar}
									alt="avatar"
									className="w-full h-full object-cover"
								/>
							) : (
								<NoImageIcon className="w-8 h-8 text-slate-100" />
							)}
						</div>
					</div>
					<div>
						<p className="font-serif font-bold text-xl/none">{user.username}</p>
						<p>ID {user.id.split("-")[0].toUpperCase()}</p>
					</div>
				</div>
				<button
					onClick={() => setChangingInfo(true)}
					type="button"
					className={clsx(
						"uppercase text-blue-500 font-medium px-4 py-1 hover:underline",
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
						"uppercase text-blue-500 bg-blue-50 px-4 py-1 rounded hover:bg-blue-100 transition-colors font-medium",
						!changingInfo && "hidden",
					)}
				>
					Сохранить
				</button>
			</div>
			<div className="flex flex-col gap-3 mt-6 md:pl-16 lg:flex-row">
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
				<div className="space-y-3 flex-1">
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
