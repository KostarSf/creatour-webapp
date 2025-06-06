import { Link, href } from "react-router";

import type { Tag } from "@prisma-app/client";
import LayoutWrapper from "~/components/LayoutWrapper";
import { buttonVariants } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

interface FooterProps {
	tags: Tag[];
	hasNews: boolean;
}

export function Footer({ hasNews, tags }: FooterProps) {
	return (
		<footer className="bg-secondary pb-16">
			<LayoutWrapper className="space-y-6 p-5 md:py-10">
				<div className="grid grid-cols-2 gap-y-12 md:grid-cols-4">
					<div className="col-span-2 space-y-3 md:space-y-6">
						<Link
							to="/"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto p-0 font-serif text-5xl text-foreground md:pb-6",
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
									to="mailto:creatour@kostarlab.ru"
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
						<p className="font-serif text-3xl md:pb-3">Каталог</p>
						{hasNews ? (
							<Link
								to={`${href("/products")}?news=true#content`}
								className={cn(
									buttonVariants({ variant: "link" }),
									"h-auto justify-start p-0 text-foreground",
								)}
							>
								Новинки
							</Link>
						) : null}
						{tags.slice(0, 4).map((tag) => (
							<Link
								key={tag.id}
								to={`${href("/products")}?tags=${tag.id}#content`}
								className={cn(
									buttonVariants({ variant: "link" }),
									"h-auto justify-start p-0 text-foreground",
								)}
							>
								{tag.name}
							</Link>
						))}
						<Link
							to={`${href("/products")}#content`}
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start p-0 text-foreground",
							)}
						>
							Весь каталог
						</Link>
					</div>
					<div className="flex flex-col space-y-3">
						<p className="font-serif text-3xl md:pb-3">Клиентам</p>
						<Link
							to={`${href("/")}#brand-about`}
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
							to={href("/recognize")}
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start whitespace-normal p-0 text-foreground sm:whitespace-nowrap",
							)}
						>
							Распознавание объекта / <br className="hidden sm:inline" /> Поиск по фото
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
				<div className="grid gap-y-3 md:grid-cols-4">
					<div>
						<Link
							to="/docs/privacy-policy.pdf"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start whitespace-normal p-0 pr-2 text-foreground text-xs",
							)}
							target="_blank"
						>
							Политика конфиденциальности
						</Link>
					</div>
					<div>
						<Link
							to="/docs/user-agreement.pdf"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start whitespace-normal p-0 pr-2 text-foreground text-xs",
							)}
							target="_blank"
						>
							Пользовательское соглашение
						</Link>
					</div>
					<div>
						<Link
							to="/docs/public-offer.pdf"
							className={cn(
								buttonVariants({ variant: "link" }),
								"h-auto justify-start whitespace-normal p-0 pr-2 text-foreground text-xs",
							)}
							target="_blank"
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
							Автор сайта
						</Link>
					</div>
				</div>
			</LayoutWrapper>
		</footer>
	);
}
