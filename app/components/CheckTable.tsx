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
    <table className='divide-y w-full'>
      <thead>
        <tr>
          <th className='py-2 pr-4 text-left'>Покупатель</th>
          <th className='py-2 px-4 text-left'>Email</th>
          <th className='py-2 px-4 text-left'>Турпродукт</th>
          <th className='py-2 px-4 text-left'>Разработчик</th>
          <th className='py-2 px-4 text-right'>Цена</th>
          <th className='py-2 pl-4 text-right'>Дата покупки</th>
        </tr>
      </thead>
      <tbody className='divide-y'>
        {checks.map((check) => (
          <tr key={check.id}>
            <td className='py-2 pr-4 font-bold'>{check.buyerName}</td>
            <td className='py-2 px-4 font-bold'>{check.buyerEmail}</td>
            <td className='py-2 px-4 text-blue-500'>{check.productName}</td>
            <td className='py-2 px-4'>{check.sellerName}</td>
            <td className='py-2 px-4 font-bold text-blue-500 whitespace-nowrap text-right'>
              {check.price.toLocaleString("ru-ru")} ₽
            </td>
            <td className='py-2 pl-4 text-right'>
              {new Date(check.date).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
