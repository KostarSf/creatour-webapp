import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import CatalogLayout from "~/components/old/CatalogLayout";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const userData = await getUser(request);
	if (!userData) {
		throw redirect("/login");
	}
	const user = await db.user.findUnique({
		where: { id: userData.id },
		include: {
			activeProducts: true,
			comments: {
				include: {
					parentPlace: { select: { name: true } },
					parentProduct: { select: { name: true } },
				},
			},
			ratings: {
				include: {
					place: { select: { name: true } },
					product: { select: { name: true } },
				},
			},
		},
	});
	if (user) {
		return { user, userData };
	}
	throw redirect("/login");
}

export default function UserPage() {
	const data = useLoaderData<typeof loader>();
	const user = data.user;

	return (
		<CatalogLayout
			sideBlock={<SideBlockUser user={{ ...data.userData, role: user.role }} />}
		>
			<div>
				<p>Активные турпродукты:</p>
				<div>
					{user.activeProducts.map((product) => (
						<Link
							to={`/product/${product.id}`}
							key={product.id}
							className="block text-blue-600 hover:underline"
						>
							{product.name}
						</Link>
					))}
				</div>
				<p className="mt-4">Комментарии:</p>
				<div>
					{user.comments.map((comment) => (
						<div key={comment.id}>
							<p>
								<Link
									to={`/${comment.placeId ? "place" : "product"}/${
										comment.placeId ?? comment.productId
									}`}
									className="text-blue-600 hover:underline"
								>
									{comment.placeId
										? comment.parentPlace?.name
										: comment.parentProduct?.name}
								</Link>
							</p>
						</div>
					))}
				</div>
				<p className="mt-4">Оценки:</p>
				<div>
					{user.ratings.map((rating) => (
						<Link
							to={`/${rating.placeId ? "place" : "product"}/${
								rating.placeId ?? rating.productId
							}`}
							key={rating.id}
							className="block"
						>
							<span className="text-blue-600 hover:underline">
								{rating.placeId ? rating.place?.name : rating.product?.name}
							</span>
							{` ${rating.value}`}
						</Link>
					))}
				</div>
			</div>
		</CatalogLayout>
	);
}

function SideBlockUser({
	user,
}: {
	user: {
		id: string;
		username: string;
		role: string;
	};
}) {
	let localeRole = "Пользователь";
	switch (user.role) {
		case "placeowner":
			localeRole = "Владелец ресурса";
			break;
		case "admin":
			localeRole = "Администратор";
			break;
		case "creator":
			localeRole = "Создатель турпродуктов";
			break;
	}

	return (
		<div>
			<p className="mb-2">
				Вы вошли как <span className="font-semibold">{user.username}</span>
			</p>
			<p className="mb-2">
				Ваша роль: <span className="font-semibold">{localeRole}</span>
			</p>
			{user.role !== "user" ? (
				<p className="mb-2">
					Посетить{" "}
					<Link
						to={"/admin"}
						className="font-semibold text-blue-600 hover:underline"
					>
						Админпанель
					</Link>
				</p>
			) : null}
			<Form action="/logout" method="post">
				<button
					type="submit"
					className="rounded-lg bg-blue-600 px-5 py-1 font-semibold text-lg text-white"
				>
					Выйти
				</button>
			</Form>
		</div>
	);
}
