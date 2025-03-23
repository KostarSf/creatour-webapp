import { Link, href } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

export function Footer() {
	return (
		<footer className="bg-secondary pb-16">
			<div className="mx-auto max-w-6xl space-y-6 p-5 md:p-10">
				<div className="grid grid-cols-2 gap-y-12 sm:grid-cols-4">
					<div className="col-span-2 space-y-3 sm:space-y-6">
						<Link
							to="/"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto p-0 font-serif text-5xl text-foreground sm:pb-6",
							)}
						>
							Креатур
						</Link>
						<div className="grid">
							<p className="text-xl">Краснодар</p>
							<p>Лескова, 89</p>
						</div>
						<div className="grid">
							<p>
								<Link
									to="tel:+77775554265"
									className={cn(
										buttonVariants({ variant: "link" }),
										"h-auto justify-start p-0 text-foreground",
									)}
								>
									+7 (777) 555-42-65
								</Link>
							</p>
							<p>
								<Link
									to="mailto:hello@creatur.com"
									className={cn(
										buttonVariants({ variant: "link" }),
										"h-auto justify-start p-0 text-foreground",
									)}
								>
									hello@creatur.com
								</Link>
							</p>
						</div>
					</div>
					<div className="flex flex-col space-y-3">
						<p className="font-serif text-3xl sm:pb-3">Каталог</p>
						<Link
							to="#"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start p-0 text-foreground",
							)}
						>
							Новинки
						</Link>
						<Link
							to="#"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start p-0 text-foreground",
							)}
						>
							Мастер-классы
						</Link>
						<Link
							to="#"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start p-0 text-foreground",
							)}
						>
							Лекции
						</Link>
						<Link
							to="#"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start p-0 text-foreground",
							)}
						>
							Экскурсии
						</Link>
					</div>
					<div className="flex flex-col space-y-3">
						<p className="font-serif text-3xl sm:pb-3">Клиентам</p>
						<Link
							to="#"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start p-0 text-foreground",
							)}
						>
							О бренде
						</Link>
						<Link
							to="#"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start p-0 text-foreground",
							)}
						>
							Оплата
						</Link>
						<Link
							to="/object-recognizer/index.html"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start p-0 text-foreground",
							)}
							reloadDocument
						>
							Распознавание объекта / <br /> Поиск по фото
						</Link>
						<Link
							to={href("/faq")}
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start p-0 text-foreground",
							)}
						>
							FAQs
						</Link>
					</div>
				</div>
				<Separator />
				<div className="grid gap-y-3 sm:grid-cols-4">
					<div className="sm:col-span-2">
						<Link
							to="#"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start p-0 text-foreground",
							)}
						>
							Политика конфиденциальности
						</Link>
					</div>
					<div>
						<Link
							to="#"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start p-0 text-foreground",
							)}
						>
							Договор оферта
						</Link>
					</div>
					<div>
						<Link
							to="#"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start p-0 text-foreground",
							)}
						>
							Атор сайта
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
