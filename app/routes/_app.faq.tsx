import clsx from "clsx";
import { CheckCircle2Icon, CircleAlertIcon, LoaderCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, href, useFetcher } from "react-router";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useOptionalUser } from "~/utils/user";
import type { SendFeedbackAction } from "./api.send-feedback";

export default function FAQPage() {
	return (
		<>
			<div className="pointer-events-none absolute top-0 right-0 left-0 h-screen">
				<img src="/images/figures.svg" className="h-full w-full object-cover blur-md" aria-hidden />
			</div>
			<div className="pointer-events-none mx-auto max-w-6xl px-5 pt-12 md:absolute md:top-0 md:right-0 md:left-0 md:h-screen md:p-0 md:px-10">
				<div className="mx-auto flex h-full max-w-6xl flex-col items-stretch justify-center gap-12">
					<div className="flex flex-col gap-12 md:flex-row md:items-center">
						<div className="pointer-events-auto">
							<p className="font-serif text-4xl/8 text-blue-500 lg:text-6xl/12">
								Есть <br className="hidden md:inline" /> вопросы?
							</p>
						</div>
						<div className="pointer-events-auto flex-1">
							<FaqAccordion />
						</div>
					</div>
					<div className="pointer-events-auto flex w-full justify-end">
						<FeedbackDialog />
					</div>
				</div>
			</div>
		</>
	);
}

function FaqAccordion() {
	return (
		<Accordion type="single" collapsible>
			<AccordionItem value="item-1">
				<AccordionTrigger>Забыл пароль, что делать?</AccordionTrigger>
				<AccordionContent>
					<div className="space-y-3 pt-3 *:text-pretty md:pl-8">
						<p>Посмотрите сохранённые пароли в настройках браузера.</p>
						<p>
							Нажать кнопку «Забыли пароль?» на сайте. Следуя инструкциям, можно восстановить
							пароль.
						</p>
						<p>
							Если не удаётся восстановить пароль самостоятельно, рекомендуется обратиться по
							горячей линию{" "}
							<Link
								to="tel:+77775554265"
								className="whitespace-nowrap text-blue-500 hover:underline"
							>
								+7 (777) 555-42-65
							</Link>{" "}
							или в службу техподдержки.
						</p>
					</div>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Могу ли я быть одновременно и клиентом и продавцом?</AccordionTrigger>
				<AccordionContent>
					<div className="space-y-3 pt-3 *:text-pretty md:pl-8">
						<p>
							Да, вы можете быть и клиентом, и продавцом. Просто следите за тем, чтобы ваша
							деятельность как продавца и покупателя была прозрачной и соответствовала правилам
							платформы.
						</p>
						<p>
							С правилами и ограничениями платформы Креатур можно ознакомиться{" "}
							<Link to="#" className="whitespace-nowrap text-blue-500 hover:underline">
								здесь
							</Link>
							.
						</p>
					</div>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-3">
				<AccordionTrigger>Есть ли ограничения на публикацию турпродуктов?</AccordionTrigger>
				<AccordionContent>
					<div className="space-y-3 pt-3 *:text-pretty md:pl-8">
						<p>
							На платформе установлены определенные правила и ограничения для публикации
							турпродуктов.
						</p>
						<p>Вот некоторые из них:</p>
						<ol className="list-inside list-decimal">
							<li>Качество контента</li>
							<li>Соответствие законодательству</li>
							<li>Ценообразование</li>
							<li>Ограничение на количество публикаций</li>
							<li>Условия отмены и возврата</li>
							<li>Политика отзывов</li>
							<li>Соблюдение авторских прав</li>
							<li>Периодичность обновления</li>
						</ol>
						<p>
							Перед началом работы с платформой Креатур обязательно изучите её правила и
							требования. Это поможет избежать проблем и обеспечит успешное продвижение ваших
							турпродуктов.
						</p>
						<p>
							С правилами и ограничениями платформы Креатур можно ознакомиться{" "}
							<Link to="#" className="whitespace-nowrap text-blue-500 hover:underline">
								здесь
							</Link>
							.
						</p>
					</div>
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-4">
				<AccordionTrigger>Как начать создавать турпродукты?</AccordionTrigger>
				<AccordionContent>
					<div className="space-y-3 pt-3 *:text-pretty md:pl-8">
						<p>
							Для публикации вашего турпродукта подготовьте всю необходимую документацию:
							описания туров, фотографии, цены, условия бронирования и отмены.
						</p>
						<p>Убедитесь, что вся информация соответствует требованиям платформы.</p>
						<p>Зарегистрируйтесь как разработчик турпродуктов.</p>
						<p>
							Заполните профиль компании, добавьте описание продуктов и загрузите необходимые
							материалы.
						</p>
						<p>
							Проведите тестовый запуск своего продукта, чтобы убедиться в правильности настроек
							и корректности работы всех процессов.
						</p>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}

function FeedbackDialog() {
	const user = useOptionalUser();
	const [open, setOpen] = useState(false);

	const fetcher = useFetcher<SendFeedbackAction>();
	const pending = fetcher.state !== "idle";

	useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data?.success) {
			toast("Спасибо! Ваше сообщение отправлено.", {
				icon: <CheckCircle2Icon className="fill-green-600 text-white" />,
			});

			setOpen(false);
		}

		if (fetcher.state === "idle" && fetcher.data?.success === false) {
			toast("Ой! Произошла ошибка при отправке.", {
				icon: <CircleAlertIcon className="fill-destructive text-white" />,
			});
		}
	}, [fetcher]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>Связаться с нами</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Креатур</DialogTitle>
					<DialogDescription>
						Здесь Вы можете задать интересующий вас вопрос или оставить предложение.
					</DialogDescription>
				</DialogHeader>
				<fetcher.Form id="feedback-form" method="POST" action={href("/api/send-feedback")}>
					<div className="space-y-4 py-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="grid gap-1.5">
								<Label htmlFor="name" className="px-3">
									Имя
								</Label>
								<Input
									autoComplete="name"
									placeholder="Ваше имя."
									id="name"
									name="name"
									defaultValue={user?.username}
									required
								/>
							</div>
							<div className="grid gap-1.5">
								<Label htmlFor="email" className="px-3">
									E-mail
								</Label>
								<Input
									autoComplete="email"
									inputMode="email"
									placeholder="Ваш E-mail."
									id="email"
									name="email"
									defaultValue={user?.email}
									required
								/>
							</div>
						</div>
						<div className="grid gap-1.5">
							<Label htmlFor="message" className="px-3">
								Комментарий
							</Label>
							<Textarea
								placeholder="Напишите Ваш комментарий здесь."
								minLength={10}
								id="message"
								name="message"
								className="h-24"
								required
							/>
						</div>
					</div>
				</fetcher.Form>
				<DialogFooter>
					<Button
						type="submit"
						form="feedback-form"
						disabled={pending}
						className={clsx(!open && "hidden")}
					>
						{!pending ? "Отправить" : <LoaderCircleIcon className="animate-spin" />}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
