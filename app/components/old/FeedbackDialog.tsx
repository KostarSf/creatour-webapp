import { useEffect, useRef } from "react";
import type { FormMethod } from "react-router";
import { Form } from "react-router";
import CloseIcon from "./icons/CloseIcon";

export default function FeedbackDialog({
	method,
	action,
	children,
	visible,
	onClose,
	postId,
}: {
	method: FormMethod;
	action: string;
	children?: React.ReactNode | React.ReactNode[];
	visible: boolean;
	onClose: VoidFunction;
	postId: string;
}) {
	const PICheckRef = useRef<HTMLInputElement>(null);
	const TOSCheckRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const body = document.querySelector("body");
		if (visible) {
			body?.classList.add("overflow-hidden");
		} else {
			body?.classList.remove("overflow-hidden");
			if (PICheckRef.current) PICheckRef.current.checked = false;
			if (TOSCheckRef.current) TOSCheckRef.current.checked = false;
		}
	}, [visible]);

	return (
		<div
			className={`fixed inset-0 z-10 flex items-center justify-center transition ${
				visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
			}`}
			style={{
				background: "rgba(200, 200, 200, 0.9)",
			}}
			onClick={onClose}
		>
			<div
				className={`h-full w-full overflow-hidden overflow-y-auto rounded-sm bg-white px-4 shadow-xl transition md:h-fit md:max-h-full md:max-w-lg ${visible ? " translate-y-0" : " -translate-y-4"}`}
				onClick={(e) => e.stopPropagation()}
			>
				<Form method={method} action={action} className="h-full">
					<div className="flex h-full flex-col items-stretch">
						<div className="-mx-4 mb-4 flex items-center justify-between gap-2 border-b p-4 ">
							<p className="font-semibold text-lg text-slate-500 leading-5">
								Автоматическое посевное утройство для полей
							</p>
							<button
								type="button"
								onClick={onClose}
								className="self-start rounded-sm bg-slate-100 p-2 text-slate-600"
							>
								<CloseIcon />
							</button>
						</div>
						<p className="mb-4 text-slate-600">
							Заинтересованы этим проектом? <br /> Заполните форму и мы свяжемся с Вами в
							ближайшее время, расскажем детали и ответим на вопросы!
						</p>
						<input type="hidden" value={postId} name="postId" required />
						{children}
						<label className="mt-3 text-slate-500">
							<input
								type="checkbox"
								name="personalInfoAgreement"
								className="mr-1"
								ref={PICheckRef}
								required
							/>
							Я даю согласие на обработку личной информации
						</label>
						<label className="mt-3 text-slate-500">
							<input
								type="checkbox"
								name="termsOfServiceAgreement"
								className="mr-1"
								ref={TOSCheckRef}
								required
							/>
							Я согласен с{" "}
							<a href="/terms" className="text-blue-600 hover:underline">
								правилами пользования
							</a>{" "}
							сервиса
						</label>
						<div className="mt-12 flex grow flex-col-reverse justify-start gap-2 pb-4 md:flex-row md:justify-end">
							<button
								type="button"
								onClick={onClose}
								className="rounded-sm border border-slate-400 px-4 py-2 font-semibold text-slate-400 transition hover:border-slate-400 hover:bg-slate-400 hover:text-white hover:shadow-md hover:shadow-slate-200"
							>
								Закрыть
							</button>
							<button
								type="submit"
								className="rounded-sm bg-blue-500 px-12 py-2 font-semibold text-white transition hover:bg-blue-400 hover:shadow-blue-100 hover:shadow-md"
							>
								Отправить
							</button>
						</div>
					</div>
				</Form>
			</div>
		</div>
	);
}
