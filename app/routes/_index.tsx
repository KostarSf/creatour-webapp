import type { MetaFunction } from "react-router";
import { Link, href, useLoaderData } from "react-router";
import { Socials } from "~/components/Socials";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { db } from "~/utils/db.server";
import { useOptionalUser } from "~/utils/user";
import { Footer } from "~/widgets/footer";
import type { Route } from "./+types/_index";

export const meta: MetaFunction = () => [
	{ title: "Добро пожаловать | Креатур" },
	{
		name: "description",
		content: "Открой для себя Креативный туризм!",
	},
];

export const loader = async () => {
	const newsMinDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
	const [products, tags, newsCount] = await db.$transaction([
		db.product.findMany({
			where: {
				active: true,
				beginDate: {
					gte: new Date(),
				},
			},
			orderBy: {
				beginDate: "asc",
			},
			take: 3,
		}),
		db.tag.findMany({
			where: {
				products: {
					some: {
						active: true,
						beginDate: {
							gte: new Date(),
						},
					},
				},
			},
			orderBy: { name: "asc" },
		}),
		db.product.count({ where: { active: true, createdAt: { gt: newsMinDate } } }),
	]);

	return {
		cards: products.map((product) => ({
			id: product.id,
			name: product.name,
			image: `/images/products/${product.image}`,
			link: `/products/${product.id}`,
		})),
		tags,
		hasNews: newsCount > 0,
	};
};

export default function LandingPage({ loaderData }: Route.ComponentProps) {
	const user = useOptionalUser();

	return (
		<>
			<div className="flex min-h-screen items-stretch justify-center bg-center bg-cover bg-white md:bg-[url('/images/landing/landing_bg.webp')]">
				<div className="flex max-w-[100rem] grow flex-col justify-between px-6 py-6 sm:px-12">
					<div />
					<div className="mt-32 flex flex-col items-center md:mt-0 md:items-start">
						<h1 className="text-center font-bold font-serif text-4xl text-blue-500 sm:text-5xl md:text-left md:text-6xl md:text-white md:drop-shadow-sm">
							Открой для себя <br />
							Креативный туризм
						</h1>
						<p className="mt-4 mb-12 text-center font-medium text-gray-600 text-xl md:text-left md:text-2xl md:text-white md:drop-shadow-sm">
							Отдыхай по новому с командой Креатура
						</p>

						{/** Если вход выполнен и это обычный пользователь, посылаем его в каталог */}
						{/** Если это редактор, посылаем его в /users, где его перенаправит на нужный кабинет */}
						<Link
							to={user ? (user.role !== "user" ? "/user" : "/products") : "/register"}
							className={cn(buttonVariants({ size: "lg" }), "max-w-96 text-base max-md:w-full")}
							prefetch="render"
						>
							{user
								? user.role !== "user"
									? "Личный кабинет"
									: "К турпродуктам"
								: "Регистрация"}
						</Link>
					</div>

					<div className="mt-32 grid gap-2 md:mt-16">
						<div className="flex xl:justify-end">
							<Link
								to={href("/products")}
								className="py-2 font-medium text-foreground hover:underline md:text-white"
							>
								Посмотреть все предложения
								<img
									src="/images/landing/arrow_right.svg"
									alt="arrow_right.svg"
									className="inline px-2 max-md:invert"
								/>
							</Link>
						</div>

						<div className="flex flex-col-reverse justify-between gap-4 xl:flex-row xl:items-end">
							<Socials className="my-12 md:my-0 md:text-white" />

							<div className="flex flex-col flex-wrap items-start gap-2 md:flex-row">
								{loaderData.cards.map((card, i) => (
									<PreviewCard
										key={card.id}
										name={card.name}
										image={card.image}
										link={card.link}
										displayId={`0${i + 1}`}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-6xl bg-white px-6 md:px-12">
				<div id="brand-about" className="my-48">
					<p className="mb-10 text-center text-4xl">***</p>
					<p className="text-center font-light text-xl leading-normal tracking-widest md:text-3xl">
						<span className="font-bold font-serif text-2xl md:text-3xl xl:text-4xl">Креатур</span>{" "}
						- это творческое объединение разнообразных компаний туристической сферы, разработчиков
						креативных туристических программ, владельцев инфраструктуры и любителей пробовать
						что-то новое.
					</p>
				</div>

				<div className="flex flex-col gap-2 lg:flex-row lg:gap-12">
					<div className="flex-3 overflow-hidden rounded-xl bg-[url(/images/landing/place_mmm.jpg)] bg-center bg-cover bg-slate-200">
						<Link
							to="/products"
							className="flex h-full w-full flex-col justify-between gap-8 bg-black/30 px-10 py-8 text-white"
						>
							<div>
								<p className="font-bold font-serif text-2xl/none">10-24</p>
								<p className="font-light tracking-wide">апреля</p>
							</div>
							<div className="flex items-center justify-between">
								<p className="font-medium sm:text-lg/snug">
									Мало-Коннюшенный мост <br className="hidden sm:inline-block" /> в
									Санкт-Петербурге
								</p>
								<img
									src="/images/landing/arrow_right.svg"
									alt="arrow_right.svg"
									className="inline px-2"
								/>
							</div>
						</Link>
					</div>

					<div className="flex-2 space-y-8 py-8">
						<h2 className="font-bold font-serif text-3xl sm:text-4xl">
							Посмотрите все направления туров
						</h2>
						<p className="text-pretty text-lg">
							Бескрайние просторы тайги, огромные реки, золотые степи и венцы человеческого
							творения - архитектурные памятники - это и делает нашу страну такой уникальной.
						</p>
						<Link to="/products" className={buttonVariants({ variant: "outline", size: "lg" })}>
							Смотреть все
						</Link>
					</div>
				</div>

				<div className="my-36 flex flex-col gap-2 lg:flex-row lg:gap-12">
					<div className="flex-3 overflow-hidden rounded-xl bg-[url(/images/landing/review.jpg)] bg-center bg-cover bg-slate-200 lg:order-1">
						<Link
							to="/reviews"
							className="flex h-full w-full flex-col justify-between gap-8 bg-black/30 px-10 py-8 text-white"
						>
							<div>
								<p className="font-bold font-serif text-2xl/none">Отзыв</p>
								<p className="font-light tracking-wide">Елена Иванова</p>
							</div>
							<div className="flex items-center justify-between">
								<p className="font-medium sm:text-lg/snug">
									Пожалуй, это был лучший <br className="hidden sm:inline-block" />{" "}
									гастрономический тур на Юге
								</p>
								<img
									src="/images/landing/arrow_right.svg"
									alt="arrow_right.svg"
									className="inline px-2"
								/>
							</div>
						</Link>
					</div>

					<div className="flex-2 space-y-8 py-8">
						<h2 className="font-bold font-serif text-3xl sm:text-4xl">
							Что пишут участники наших турпрограмм
						</h2>
						<p className="text-pretty text-lg">
							87% участников приходят по личной рекомендации от друзей. Каждый четвертый
							проводит досуг с нами больше двух раз!
						</p>
						<Link to="/reviews" className={buttonVariants({ variant: "outline", size: "lg" })}>
							Читать отзывы
						</Link>
					</div>
				</div>
			</div>
			<Footer hasNews={loaderData.hasNews} tags={loaderData.tags} />
		</>
	);
}

type PreviewCardProps = {
	link: string;
	image: string;
	displayId: string;
	name: string;
};

function PreviewCard({ link, image, displayId, name }: PreviewCardProps) {
	return (
		<Link
			to={link}
			className={"relative aspect-14/9 w-full overflow-hidden rounded-md md:h-44 md:w-auto"}
		>
			<img src={image} alt="" className="h-full w-full" />
			<div className="absolute inset-0 flex flex-col justify-between p-3">
				<p className="font-bold font-serif text-2xl text-white ">{displayId}</p>
				<p className="text-lg/tight text-white">
					<span>{name}</span>
					<img
						src="/images/landing/arrow_right.svg"
						alt="arrow_right.svg"
						className="inline px-2"
					/>
				</p>
			</div>
		</Link>
	);
}
