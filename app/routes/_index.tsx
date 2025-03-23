import type { MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { db } from "~/utils/db.server";
import { useOptionalUser } from "~/utils/user";
import { Footer } from "~/widgets/footer";

export const meta: MetaFunction = () => [
	{ title: "Добро пожаловать | Креатур" },
	{
		name: "description",
		content: "Открой для себя Креативный туризм!",
	},
];

export const loader = async () => {
	const products = await db.product.findMany({
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
	});

	return {
		cards: products.map((product) => ({
			id: product.id,
			name: product.name,
			image: `images/products/${product.image}`,
			link: `/products/${product.id}`,
		})),
	};
};

export default function LandingPage() {
	const { cards } = useLoaderData<typeof loader>();

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
						>
							{user
								? user.role !== "user"
									? "Личный кабинет"
									: "К турпродуктам"
								: "Регистрация"}
						</Link>
					</div>

					<div className="mt-32 flex flex-col-reverse justify-between gap-4 md:mt-16 xl:flex-row xl:items-end">
						<div className="my-12 flex flex-col items-center md:my-0 md:items-start">
							<p className="text-lg md:text-white md:drop-shadow-sm">Креатур в соцсетях</p>
							<div className="mt-2 flex gap-6">
								{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
								<a href="#" className="cursor-pointer text-black md:text-white">
									<svg
										width="24"
										height="20"
										viewBox="0 0 24 20"
										fill="currentColor"
										role="graphics-symbol"
									>
										<path d="M22.3887 1.63908C21.5478 0.474883 19.9952 0 17.0301 0H6.26655C3.23352 0 1.6546 0.505515 0.816817 1.74497C0 2.95344 0 4.73404 0 7.19842V11.8955C0 16.6698 0.969148 19.0939 6.26655 19.0939H17.0301C19.6015 19.0939 21.0264 18.6749 21.9482 17.6474C22.8935 16.5938 23.2968 14.8737 23.2968 11.8955V7.19842C23.2968 4.59952 23.2337 2.80843 22.3887 1.63908ZM14.9567 10.1955L10.069 13.1703C9.9597 13.2369 9.8402 13.2699 9.72085 13.2699C9.58573 13.2699 9.45092 13.2275 9.3315 13.1433C9.10665 12.9846 8.96935 12.7008 8.96935 12.3946V6.46395C8.96935 6.15833 9.10627 5.87477 9.33068 5.716C9.55515 5.55725 9.83433 5.5464 10.0672 5.6873L14.955 8.64302C15.2036 8.79338 15.3597 9.09235 15.3601 9.41854C15.3604 9.74499 15.205 10.0444 14.9567 10.1955Z" />
									</svg>
								</a>
								{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
								<a href="#" className="cursor-pointer text-black md:text-white">
									<svg
										width="13"
										fill="currentColor"
										height="20"
										viewBox="0 0 13 20"
										role="graphics-symbol"
									>
										<path d="M11.4832 0.00407466L8.62112 0C5.40568 0 3.32772 1.89166 3.32772 4.81951V7.04163H0.450033C0.201367 7.04163 0 7.2205 0 7.44115V10.6608C0 10.8814 0.201597 11.0601 0.450033 11.0601H3.32772V19.1842C3.32772 19.4048 3.52909 19.5834 3.77775 19.5834H7.53231C7.78098 19.5834 7.98235 19.4046 7.98235 19.1842V11.0601H11.347C11.5957 11.0601 11.7971 10.8814 11.7971 10.6608L11.7984 7.44115C11.7984 7.33521 11.7509 7.23376 11.6666 7.15877C11.5824 7.0838 11.4676 7.04163 11.3482 7.04163H7.98235V5.15791C7.98235 4.25252 8.2255 3.7929 9.55471 3.7929L11.4827 3.79229C11.7312 3.79229 11.9325 3.61341 11.9325 3.39297V0.403392C11.9325 0.183156 11.7314 0.00448213 11.4832 0.00407466Z" />
									</svg>
								</a>
								{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
								<a href="#" className="cursor-pointer text-black md:text-white">
									<svg
										width="23"
										height="23"
										viewBox="0 0 23 23"
										fill="currentColor"
										role="graphics-symbol"
									>
										<path d="M22.0707 2.61635C21.2024 3.07538 20.3339 3.36205 19.4661 3.47719C20.4463 2.75429 21.1094 1.73302 21.4549 0.413451C20.5581 1.06739 19.6013 1.51478 18.5839 1.75586C17.6874 0.585451 16.586 0 15.2786 0C14.0277 0 12.9612 0.542104 12.0785 1.62655C11.1964 2.71093 10.7553 4.02183 10.7553 5.5594C10.7553 5.97242 10.7926 6.39715 10.8673 6.83315C9.01872 6.71842 7.28457 6.14757 5.66463 5.12057C4.04477 4.09344 2.67002 2.72505 1.5404 1.01536C1.12959 1.87578 0.92412 2.81114 0.92412 3.8209C0.92412 4.77331 1.10614 5.657 1.47044 6.47173C1.8345 7.28633 2.32476 7.94605 2.94098 8.45101C2.21263 8.41653 1.53111 8.18124 0.896359 7.74518V7.81402C0.896359 9.15668 1.23946 10.3355 1.92559 11.3513C2.61181 12.367 3.4778 13.0064 4.52336 13.2704C4.1312 13.3965 3.73434 13.4596 3.33294 13.4596C3.0715 13.4596 2.78672 13.431 2.47868 13.374C2.76808 14.4869 3.30028 15.4016 4.07508 16.1193C4.85004 16.8363 5.72765 17.206 6.70799 17.2295C5.06488 18.8128 3.193 19.6044 1.09236 19.6044C0.690832 19.6044 0.326826 19.582 0 19.5359C2.1007 21.1995 4.41604 22.0314 6.94618 22.0314C8.552 22.0314 10.0598 21.719 11.4691 21.0934C12.8792 20.4683 14.0834 19.6305 15.0825 18.5803C16.0813 17.5305 16.9427 16.3227 17.6662 14.9572C18.3896 13.5917 18.9287 12.166 19.2837 10.6801C19.6384 9.19382 19.8158 7.70527 19.8158 6.21327C19.8158 5.89194 19.8111 5.65109 19.8017 5.49036C20.6889 4.69897 21.4451 3.74065 22.0707 2.61635Z" />
									</svg>
								</a>
								{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
								<a href="#" className="cursor-pointer text-black md:text-white">
									<svg
										width="25"
										height="17"
										viewBox="0 0 25 17"
										fill="currentColor"
										role="graphics-symbol"
									>
										<path d="M24.3929 14.8167C24.3633 14.7428 24.3356 14.6815 24.3098 14.6324C23.8843 13.7476 23.0713 12.6615 21.8711 11.3738L21.8457 11.3443L21.8331 11.3299L21.8202 11.3151H21.8074C21.2626 10.7155 20.9177 10.3123 20.7732 10.1059C20.509 9.71273 20.4498 9.31473 20.5942 8.91148C20.6962 8.6068 21.0796 7.96336 21.7434 6.9803C22.0924 6.45929 22.3689 6.04173 22.5732 5.72714C24.0459 3.46633 24.6844 2.02164 24.4885 1.39252L24.4124 1.2455C24.3613 1.15699 24.2294 1.07601 24.0168 1.00217C23.8038 0.928478 23.5314 0.916292 23.1994 0.965401L19.5223 0.994732C19.4627 0.970358 19.3776 0.972631 19.2669 1.00217C19.1562 1.03171 19.1008 1.04653 19.1008 1.04653L19.0368 1.08345L18.986 1.12781C18.9435 1.15714 18.8966 1.20873 18.8455 1.28247C18.7946 1.35596 18.7522 1.44219 18.7181 1.54047C18.3178 2.72979 17.8626 3.83556 17.3518 4.85773C17.0368 5.46723 16.7476 5.99546 16.4834 6.44272C16.2196 6.88982 15.9983 7.21922 15.8196 7.43039C15.6407 7.64175 15.4793 7.81108 15.3343 7.93899C15.1896 8.06696 15.0791 8.12102 15.0025 8.10124C14.9259 8.08147 14.8536 8.06185 14.7852 8.04222C14.6662 7.9537 14.5704 7.83334 14.4982 7.68099C14.4256 7.52866 14.3768 7.33693 14.3513 7.10593C14.3258 6.87479 14.3108 6.67597 14.3065 6.50881C14.3025 6.34187 14.3043 6.10572 14.313 5.80104C14.3219 5.4962 14.3258 5.28995 14.3258 5.18182C14.3258 4.80826 14.3322 4.40283 14.3448 3.96544C14.3577 3.52804 14.3681 3.18149 14.3768 2.92618C14.3855 2.6706 14.3896 2.40023 14.3896 2.11517C14.3896 1.83012 14.3745 1.60656 14.3448 1.44431C14.3155 1.28226 14.2705 1.12497 14.2111 0.972475C14.1514 0.820138 14.064 0.702294 13.9494 0.618638C13.8345 0.535083 13.6916 0.468777 13.5217 0.419513C13.0705 0.301618 12.4959 0.237843 11.7978 0.227928C10.2146 0.208305 9.19738 0.326354 8.74623 0.581921C8.56748 0.689901 8.40573 0.837437 8.26111 1.02406C8.10785 1.24038 8.08648 1.35843 8.19711 1.37785C8.70791 1.46621 9.06952 1.67757 9.28235 2.01173L9.35905 2.18881C9.4187 2.31657 9.47826 2.54275 9.53788 2.86705C9.59741 3.19134 9.63582 3.5501 9.65272 3.94307C9.6952 4.66071 9.6952 5.27503 9.65272 5.78606C9.6101 6.2973 9.56986 6.69528 9.53144 6.98034C9.49303 7.2654 9.43561 7.49638 9.35905 7.67325C9.28235 7.85018 9.23132 7.95831 9.20574 7.99755C9.1802 8.0368 9.15891 8.06154 9.14202 8.07123C9.03137 8.1202 8.91631 8.14514 8.79721 8.14514C8.67795 8.14514 8.53332 8.07625 8.36311 7.93858C8.19296 7.8009 8.01635 7.6118 7.8333 7.37095C7.65026 7.13005 7.44384 6.7934 7.21393 6.36097C6.9842 5.92854 6.74584 5.41745 6.49898 4.82773L6.29474 4.40004C6.16706 4.12489 5.99265 3.72428 5.77133 3.19852C5.54988 2.67257 5.35414 2.16381 5.18397 1.67235C5.11594 1.46595 5.01376 1.30881 4.87759 1.20067L4.81369 1.15632C4.7712 1.11707 4.703 1.07539 4.60945 1.03098C4.51576 0.986625 4.418 0.954815 4.31576 0.935242L0.817314 0.964574C0.459818 0.964574 0.217253 1.0581 0.0895307 1.24488L0.038415 1.33323C0.0128796 1.38245 0 1.46104 0 1.56923C0 1.67736 0.0255355 1.81008 0.0766511 1.96722C0.58736 3.35325 1.14275 4.68995 1.74281 5.97754C2.34287 7.26514 2.86431 8.30233 3.30682 9.08819C3.74942 9.87462 4.20057 10.6168 4.66025 11.3145C5.11993 12.0124 5.42421 12.4597 5.57309 12.6562C5.72214 12.853 5.83921 13.0002 5.92432 13.0985L6.24358 13.4522C6.44787 13.6882 6.74785 13.9708 7.14367 14.3C7.53958 14.6294 7.97789 14.9537 8.45882 15.2734C8.93983 15.5926 9.49943 15.853 10.1379 16.0545C10.7763 16.2561 11.3976 16.3371 12.002 16.298H13.4704C13.7681 16.2683 13.9938 16.1603 14.1471 15.9736L14.1979 15.8997C14.2321 15.841 14.2641 15.7499 14.2935 15.6272C14.3235 15.5044 14.3383 15.3691 14.3383 15.2218C14.3296 14.7992 14.3574 14.4183 14.4212 14.0793C14.4848 13.7403 14.5573 13.4848 14.6385 13.3127C14.7195 13.1407 14.811 12.9956 14.9129 12.878C15.0149 12.7601 15.0876 12.6887 15.1303 12.6641C15.1727 12.6393 15.2065 12.6225 15.232 12.6125C15.4363 12.5339 15.6768 12.61 15.9536 12.8412C16.2304 13.0722 16.4899 13.3574 16.7326 13.6964C16.9752 14.0356 17.2667 14.4163 17.6071 14.8388C17.9478 15.2616 18.2457 15.5758 18.5008 15.7825L18.7561 15.9595C18.9267 16.0774 19.148 16.1856 19.4204 16.2839C19.6924 16.3821 19.9306 16.4068 20.1351 16.3576L23.4037 16.2987C23.727 16.2987 23.9785 16.2369 24.1569 16.1142C24.3358 15.9913 24.442 15.856 24.4762 15.7089C24.5104 15.5615 24.5122 15.3943 24.4827 15.2072C24.4524 15.0208 24.4226 14.8904 24.3929 14.8167Z" />
									</svg>
								</a>
							</div>
						</div>

						<div className="flex flex-col flex-wrap items-start gap-2 md:flex-row">
							{cards.map((card, i) => (
								<PreviewCard
									key={card.id}
									name={card.name}
									image={card.image}
									link={card.link}
									displayId={`0${i + 1}`}
								/>
							))}

							{/* <PreviewCard
                name='Гастрономический тур по Новороссийску'
                image='/images/tour_food.png'
                link='/products/123'
                displayId='02'
              />

              <PreviewCard
                name='Достопримечательности Новороссийска'
                image='/images/trip_memorial.jpg'
                link='/products/123'
                displayId='03'
              />

              <PreviewCard
                name='Интерактивный квест "Темное сердце"'
                image='/images/sea.jpg'
                link='/products/123'
                displayId='04'
              /> */}
						</div>
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-6xl bg-white px-6 md:px-12">
				<div className="my-48">
					<p className="mb-10 text-center text-4xl">***</p>
					<p className="text-center font-light text-xl leading-normal tracking-widest md:text-3xl xl:text-4xl">
						<span className="font-bold font-serif text-2xl md:text-3xl xl:text-5xl">Креатур</span>{" "}
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
						<h2 className="font-bold font-serif text-3xl sm:text-4xl xl:text-5xl">
							Посмотрите все направления туров
						</h2>
						<p className="text-xl">
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
						<h2 className="font-bold font-serif text-3xl sm:text-4xl xl:text-5xl">
							Что пишут участники наших турпрограмм
						</h2>
						<p className="text-xl">
							87% участников приходят по личной рекомендации от друзей. Каждый 4-ый проводит
							досуг с нами больше 2-ух раз!
						</p>
						<Link to="/reviews" className={buttonVariants({ variant: "outline", size: "lg" })}>
							Читать отзывы
						</Link>
					</div>
				</div>
			</div>
			<Footer />
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
