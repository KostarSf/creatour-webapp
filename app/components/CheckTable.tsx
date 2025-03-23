export type CheckData = {
	id: string;
	buyerName: string;
	buyerEmail: string;
	sellerName: string;
	productName: string;
	price: number;
	date: string;
};

type Props = {
	checks: CheckData[];
};

export default function CheckTable({ checks }: Props) {
	return (
		<table className="w-full divide-y">
			<thead>
				<tr>
					<th className="py-2 pr-4 text-left">Покупатель</th>
					<th className="px-4 py-2 text-left">Email</th>
					<th className="px-4 py-2 text-left">Турпродукт</th>
					<th className="px-4 py-2 text-left">Разработчик</th>
					<th className="px-4 py-2 text-right">Цена</th>
					<th className="py-2 pl-4 text-right">Дата покупки</th>
				</tr>
			</thead>
			<tbody className="divide-y">
				{checks.map((check) => (
					<tr key={check.id}>
						<td className="py-2 pr-4 font-bold">{check.buyerName}</td>
						<td className="px-4 py-2 font-bold">{check.buyerEmail}</td>
						<td className="px-4 py-2 text-blue-500">{check.productName}</td>
						<td className="px-4 py-2">{check.sellerName}</td>
						<td className="whitespace-nowrap px-4 py-2 text-right font-bold text-blue-500">
							{check.price.toLocaleString("ru-ru")} ₽
						</td>
						<td className="py-2 pl-4 text-right">{new Date(check.date).toLocaleString()}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
