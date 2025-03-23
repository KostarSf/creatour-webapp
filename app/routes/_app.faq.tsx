import { Link } from "react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";

export default function FAQPage() {
	return (
		<>
			<div className="pointer-events-none absolute inset-0">
				<img src="/images/figures.svg" className="h-full w-full object-cover" aria-hidden />
			</div>
			<div className="pt-12 md:absolute md:inset-0 md:p-0">
				<div className="mx-auto flex h-full max-w-6xl flex-col items-stretch justify-center gap-12 md:flex-row md:items-center md:p-10">
					<div>
						<p className="font-serif text-4xl/8 text-blue-500 lg:text-6xl/12">
							Есть <br className="hidden md:inline" /> вопросы?
						</p>
					</div>
					<div className="flex-1">
						<Accordion type="single" collapsible>
							<AccordionItem value="item-1">
								<AccordionTrigger>Забыл пароль, что делать?</AccordionTrigger>
								<AccordionContent>
									<div className="space-y-3 pt-3">
										<p>Посмотрите сохранённые пароли в настройках браузера.</p>
										<p>
											Нажать кнопку «Забыли пароль?» на сайте. Следуя инструкциям, можно
											восстановить пароль.
										</p>
										<p>
											Если не удаётся восстановить пароль самостоятельно, рекомендуется
											обратиться по горячей линию{" "}
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
								<AccordionTrigger>
									Могу ли я быть одновременно и клиентом и продавцом?
								</AccordionTrigger>
								<AccordionContent>[текст]</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-3">
								<AccordionTrigger>
									Есть ли ограничения на публикацию турпродуктов?
								</AccordionTrigger>
								<AccordionContent>[текст]</AccordionContent>
							</AccordionItem>
							<AccordionItem value="item-4">
								<AccordionTrigger>Как начать создавать турпродукты?</AccordionTrigger>
								<AccordionContent>[текст]</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</div>
			</div>
		</>
	);
}
