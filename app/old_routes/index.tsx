import { Link } from "react-router";

export default function LandingPage() {
	return (
		<>
			<header className="absolute top-0 right-0 left-0 z-50">
				<nav className="flex justify-center gap-3 py-3 font-medium text-white">
					<a href="#creatour" className="block px-4 py-2 text-lg drop-shadow-sm">
						Креатур
					</a>
					<a href="#about" className="block px-4 py-2 text-lg drop-shadow-sm">
						О нас
					</a>
					<a href="#contacts" className="block px-4 py-2 text-lg drop-shadow-sm">
						Контакты
					</a>
				</nav>
			</header>
			<main>
				<a
					href="#creatour"
					className="fixed right-0 bottom-0 z-30 m-8 rounded-full p-2"
					style={{
						background: "rgba(255, 255, 255, 0.6)",
					}}
				>
					<img
						src="/images/landing/up-arrow.png"
						alt="Наверх"
						className="h-10 w-10 object-contain"
					/>
				</a>
				<section id="creatour" className="relative z-40 h-screen">
					<div className="absolute inset-0 flex flex-col items-start justify-center px-16">
						<h1 className="mb-8 font-serif text-7xl text-white leading-tight drop-shadow-sm">
							Открой для себя <br />
							Креативный туризм
						</h1>
						<p className="mb-12 text-3xl text-white drop-shadow-sm">
							Отдыхай по-новому с командой Креатура
						</p>
						<a
							href="/products"
							className="inline-block rounded-full bg-blue-600 px-10 py-4 font-semibold text-white text-xl"
						>
							Подобрать тур
						</a>
					</div>
					<div className="absolute right-0 bottom-0 left-0 px-16 pb-14">
						<div className="drop-shadow-sm">
							<p className="mb-2 text-white text-xl">Мы в соцсетях</p>
							<div className="flex items-center gap-4">
								{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
								<a href="#" className="cursor-pointer">
									<img src="/images/landing/yt_icon.svg" alt="yt" />
								</a>
								{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
								<a href="#" className="cursor-pointer">
									<img src="/images/landing/fb_icon.svg" alt="yt" />
								</a>
								{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
								<a href="#" className="cursor-pointer">
									<img src="/images/landing/tw_icon.svg" alt="yt" />
								</a>
								{/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
								<a href="#" className="cursor-pointer">
									<img src="/images/landing/vk_icon.svg" alt="yt" />
								</a>
							</div>
						</div>
					</div>
				</section>
				<section id="about" className="mx-auto max-w-7xl px-4">
					<div className="my-40 flex w-full flex-col gap-x-28 lg:flex-row">
						<Link
							to="/place/faa52d4e-f9af-4ad1-9c41-f1ee3acb33d5"
							className="relative flex h-56 shrink-0 flex-col justify-between overflow-hidden rounded-2xl px-14 py-6 lg:h-auto lg:w-3/6 xl:w-3/5"
							style={{
								backgroundImage: "url('/images/place_mmm.jpg')",
								backgroundSize: "cover",
							}}
						>
							<div
								className="absolute inset-0"
								style={{
									backgroundColor: "rgba(0, 0, 0, 0.3)",
								}}
							/>
							<div className="z-10" />
							<div className="z-10 flex items-end justify-between">
								<p className="text-white text-xl drop-shadow-sm">
									Мало-Коннюшенный мост <br /> в Санкт-Петербурге
								</p>
								<img
									src="/images/landing/arrow_right.svg"
									alt="arrow_right.svg"
								/>
							</div>
						</Link>
						<div className="py-10">
							<h2 className="mb-6 font-bold font-serif text-4xl">
								Посмотрите все направления туров
							</h2>
							<p className="mb-10 text-lg">
								Бескрайние просторы тайги, огромные реки, золотые степи и венцы
								человеческого творения - архитектурные памятники - это и делает
								нашу страну такой уникальной.
							</p>
							<Link
								to="/places"
								className="inline-block rounded-full border-2 border-blue-600 px-10 py-4 font-semibold text-blue-600 text-xl"
							>
								Смотреть все
							</Link>
						</div>
					</div>
					<div className="mt-40 mb-20 flex w-full flex-col gap-x-16 lg:flex-row-reverse">
						<Link
							to="/tour/8d7161d7-b78d-4b61-8f2e-8104f10acbce"
							className="relative flex h-56 shrink-0 flex-col justify-between overflow-hidden rounded-2xl px-14 py-6 lg:h-auto lg:w-3/6 xl:w-3/5"
							style={{
								backgroundImage: "url('/images/landing/review.jpg')",
								backgroundSize: "cover",
							}}
						>
							<div
								className="absolute inset-0"
								style={{
									backgroundColor: "rgba(0, 0, 0, 0.3)",
								}}
							/>
							<div className="z-10 drop-shadow-sm">
								<p className="font-semibold font-serif text-white text-xl">
									Отзыв
								</p>
								<p className="text-lg text-white">Елена Ивановна</p>
							</div>
							<div className="z-10 flex items-end justify-between">
								<p className="text-white text-xl drop-shadow-sm">
									Пожалуй, это был лучший <br /> гастрономический тур на Юге
								</p>
								<img
									src="/images/landing/arrow_right.svg"
									alt="arrow_right.svg"
								/>
							</div>
						</Link>
						<div className="py-10">
							<h2 className="mb-6 font-bold font-serif text-4xl">
								Что пишут участники наших турпрограмм
							</h2>
							<p className="mb-10 text-lg">
								87% участников приходят по личной рекомендации от друзей. Каждый
								4-ый проводит досуг с нами больше 2-ух раз!
							</p>
							<Link
								to="#"
								className="inline-block rounded-full border-2 border-blue-600 px-10 py-4 font-semibold text-blue-600 text-xl"
							>
								Читать отзывы
							</Link>
						</div>
					</div>
				</section>
				<section id="contacts" className="mx-auto mt-60 max-w-7xl px-4">
					<h3 className="mb-8 font-serif text-5xl">Контакты</h3>
					<div className="flex w-full flex-col flex-wrap justify-around gap-8 md:flex-row">
						<div className="flex">
							<img
								src="/images/landing/darya.jpg"
								alt="darya.jpg"
								className="h-28 w-28 rounded-xl object-cover lg:h-36 lg:w-36"
							/>
							<div className="my-2 ml-10">
								<p className="mb-2 font-medium text-2xl lg:text-3xl">
									Дарья Середа
								</p>
								<p className="font-mono text-md text-slate-700 leading-5">
									Продакт-менеджер <br /> Дизайнер
								</p>
							</div>
						</div>
						<div className="flex">
							<img
								src="/images/landing/maksim.jpg"
								alt="maksim.jpg"
								className="h-28 w-28 rounded-xl object-cover lg:h-36 lg:w-36"
							/>
							<div className="my-2 ml-10">
								<p className="mb-2 font-medium text-2xl lg:text-3xl">
									Максим Песков
								</p>
								<p className="font-mono text-md text-slate-700 leading-5">
									Программист
								</p>
							</div>
						</div>
					</div>
				</section>
			</main>
			<footer className="mt-60 py-10 text-center">
				<p>© 2022-2023 | ООО Креатур</p>
			</footer>
		</>
	);
}
