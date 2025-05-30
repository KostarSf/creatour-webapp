import clsx from "clsx";
import { useEffect, useState } from "react";
import { Link, useFetcher } from "react-router";
import { CardContainer } from "~/components/CardContainer";
import { InfoField } from "~/components/InfoField";
import LayoutWrapper from "~/components/LayoutWrapper";
import { NoImageIcon } from "~/components/NoImageIcon";
import { Button, buttonVariants } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import type { CurrentUser } from "~/models/users";
import type { UploadAvatarAction } from "../api.upload-avatar";

type Props = {
	user: CurrentUser;
	checksCount: number;
};

export default function UserCard({ user, checksCount }: Props) {
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
		<LayoutWrapper className="my-6 flex flex-col gap-6 md:my-12 lg:flex-row">
			<div className="flex-1">
				<CardContainer>
					<fetcher.Form method="POST">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-4">
								<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-400 transition-colors hover:bg-slate-300">
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
												src={`${user.avatar}?w=200&f=avif`}
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
						<div className="mt-6 flex flex-col gap-3 md:pl-16 lg:flex-row">
							<div className="flex-1 space-y-3">
								<InfoField
									type="text"
									disabled={!changingInfo}
									label="Город"
									name="city"
									defaultValue={user.city || ""}
								/>
								<InfoField
									type="email"
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
								<InfoField
									type="number"
									min={1}
									disabled={!changingInfo}
									label="Возраст"
									name="age"
									defaultValue={user.age || ""}
								/>
								<InfoField
									type="name"
									disabled={!changingInfo}
									label="ФИО"
									name="name"
									defaultValue={user.name || ""}
								/>
								<div className="grid space-y-1.5">
									<Label htmlFor="sex">Пол</Label>
									<Select
										name="sex"
										defaultValue={user.sex ?? "-"}
										disabled={!changingInfo}
									>
										<SelectTrigger id="sex" className="w-full">
											<SelectValue placeholder="Выберите пол" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="-">Пол не выбран</SelectItem>
												<SelectItem value="male">Мужской</SelectItem>
												<SelectItem value="female">Женский</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					</fetcher.Form>
				</CardContainer>
			</div>
			<div className="flex flex-col gap-6 xl:flex-1">
				<CardContainer>
					<p className="mb-4 font-bold font-serif text-xl/none">Способы оплаты</p>
					<div className="flex flex-wrap items-baseline justify-between gap-4">
						<p className="font-mono">**** 1234 01/23</p>
						<Button type="button" variant="outline" disabled>
							Сменить
						</Button>
					</div>
				</CardContainer>
				<CardContainer className="flex justify-between gap-5">
					<p className="mb-2 font-bold font-serif text-xl/none">
						Чеки{" "}
						<span className="ml-2 font-normal font-sans text-base text-gray-500">
							({checksCount} всего)
						</span>
					</p>
					<Link to={"checks"} className={buttonVariants({ variant: "secondary" })}>
						Смотреть
					</Link>
				</CardContainer>
			</div>
		</LayoutWrapper>
	);
}
