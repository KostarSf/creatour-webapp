import { Link } from "@remix-run/react";

export default function LandingPage() {
	return (
		<>
			<header className="absolute top-0 left-0 right-0 z-50">
				<nav className="flex justify-center gap-3 py-3 font-medium text-white">
					<a href="#creatour" className="block py-2 px-4 text-lg drop-shadow">
						Креатур
					</a>
					<a href="#about" className="block py-2 px-4 text-lg drop-shadow">
						О нас
					</a>
					<a href="#contacts" className="block py-2 px-4 text-lg drop-shadow">
						Контакты
					</a>
				</nav>
			</header>
			<main>
				<a
					href="#creatour"
					className="fixed bottom-0 right-0 z-30 m-8 rounded-full p-2"
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
						<h1 className="mb-8 font-serif text-7xl leading-tight text-white drop-shadow">
							Открой для себя <br />
							Креативный туризм
						</h1>
						<p className="mb-12 text-3xl text-white drop-shadow">
							Отдыхай по-новому с командой Креатура
						</p>
						<a
							href="/products"
							className="inline-block rounded-full bg-blue-600 px-10 py-4 text-xl font-semibold text-white"
						>
							Подобрать тур
						</a>
					</div>
					<div className="absolute left-0 right-0 bottom-0 px-16 pb-14">
						<div className="drop-shadow">
							<p className="mb-2 text-xl text-white">Мы в соцсетях</p>
							<div className="flex items-center gap-4">
								<a href="#" className="cursor-pointer">
									<img src="/images/landing/yt_icon.svg" alt="yt" />
								</a>
								<a href="#" className="cursor-pointer">
									<img src="/images/landing/fb_icon.svg" alt="yt" />
								</a>
								<a href="#" className="cursor-pointer">
									<img src="/images/landing/tw_icon.svg" alt="yt" />
								</a>
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
							></div>
							<div className="z-10"></div>
							<div className="z-10 flex items-end justify-between">
								<p className="text-xl text-white drop-shadow">
									Мало-Коннюшенный мост <br /> в Санкт-Петербурге
								</p>
								<img
									src="/images/landing/arrow_right.svg"
									alt="arrow_right.svg"
								/>
							</div>
						</Link>
						<div className="py-10">
							<h2 className="mb-6 font-serif text-4xl font-bold">
								Посмотрите все направления туров
							</h2>
							<p className="mb-10 text-lg">
								Бескрайние просторы тайги, огромные реки, золотые степи и венцы
								человеческого творения - архитектурные памятники - это и делает
								нашу страну такой уникальной.
							</p>
							<Link
								to="/places"
								className="inline-block rounded-full border-2 border-blue-600 px-10 py-4 text-xl font-semibold text-blue-600"
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
							></div>
							<div className="z-10 drop-shadow">
								<p className="font-serif text-xl font-semibold text-white">
									Отзыв
								</p>
								<p className="text-lg text-white">Елена Ивановна</p>
							</div>
							<div className="z-10 flex items-end justify-between">
								<p className="text-xl text-white drop-shadow">
									Пожалуй, это был лучший <br /> гастрономический тур на Юге
								</p>
								<img
									src="/images/landing/arrow_right.svg"
									alt="arrow_right.svg"
								/>
							</div>
						</Link>
						<div className="py-10">
							<h2 className="mb-6 font-serif text-4xl font-bold">
								Что пишут участники наших турпрограмм
							</h2>
							<p className="mb-10 text-lg">
								87% участников приходят по личной рекомендации от друзей. Каждый
								4-ый проводит досуг с нами больше 2-ух раз!
							</p>
							<Link
								to="#"
								className="inline-block rounded-full border-2 border-blue-600 px-10 py-4 text-xl font-semibold text-blue-600"
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
								<p className="mb-2 text-2xl font-medium lg:text-3xl">
									Дарья Середа
								</p>
								<p className="text-md font-mono leading-5 text-slate-700">
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
								<p className="mb-2 text-2xl font-medium lg:text-3xl">
									Максим Песков
								</p>
								<p className="text-md font-mono leading-5 text-slate-700">
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
