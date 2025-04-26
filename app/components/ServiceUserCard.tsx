import clsx from "clsx";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import type { CurrentUser } from "~/models/users";
import type { UploadAvatarAction } from "~/routes/api.upload-avatar";
import { CardContainer } from "./CardContainer";
import { InfoField } from "./InfoField";
import LayoutWrapper from "./LayoutWrapper";
import { NoImageIcon } from "./NoImageIcon";
import { Button } from "./ui/button";

export default function ServiceUserCard({ user }: { user: CurrentUser }) {
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
		<LayoutWrapper>
			<CardContainer>
				<fetcher.Form method="POST">
					<div className="flex items-start justify-between">
						<div className="flex items-center gap-4">
							<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-400 transition-colors hover:bg-slate-300">
								<label htmlFor="avatar-input" className="block h-full w-full cursor-pointer">
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
						<Button
							onClick={() => setChangingInfo(true)}
							type="button"
							variant="outline"
							className={clsx(changingInfo && "hidden")}
						>
							Изменить
						</Button>
						<Button
							type="submit"
							name="intent"
							value="change-info"
							className={clsx(!changingInfo && "hidden")}
						>
							Сохранить
						</Button>
					</div>
					<div className="mt-6 grid gap-3 md:pl-16 lg:grid-cols-3">
						<div className="grid gap-3">
							<InfoField
								type="text"
								disabled={!changingInfo}
								label="Город"
								name="city"
								defaultValue={user.city || ""}
							/>
							<InfoField
								type="text"
								disabled
								label="Email"
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
						<div className="grid gap-3 lg:col-span-2">
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
			</CardContainer>
		</LayoutWrapper>
	);
}
