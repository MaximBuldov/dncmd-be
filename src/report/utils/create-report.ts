import * as dayjs from 'dayjs';
import {
  Cost,
  Coupon,
  Order,
  OrderProduct,
  PaymentMethod,
  Product
} from 'src/generated/prisma/client';

enum NameOfClass {
  BEGINNER = 'Beginner',
  ADV = 'Int/Adv',
  CUSTOM = 'Custom'
}

interface OrderExtended extends Order {
  coupons: Coupon[];
}

interface OrderProductExtended extends OrderProduct {
  product: Product;
  order: OrderExtended;
}

interface GroupedProducts {
  [key: string]: OrderProductExtended[];
}

interface GroupedCosts {
  [key: string]: Cost[];
}

export const createReport = (
  products: OrderProductExtended[],
  costs: Cost[]
) => {
  const groupedProducts = products.reduce<GroupedProducts>((acc, obj) => {
    const yearMonth = dayjs(obj.product.date_time).format('YYYY-MM');
    if (!acc[yearMonth]) acc[yearMonth] = [];
    acc[yearMonth].push(obj);

    return acc;
  }, {});

  const groupedCosts = costs.reduce<GroupedCosts>((acc, obj) => {
    const yearMonth = dayjs(obj.date).format('YYYY-MM');
    if (!acc[yearMonth]) acc[yearMonth] = [];
    acc[yearMonth].push(obj);

    return acc;
  }, {});

  return Object.entries(groupedProducts).map(([key, obj]) => {
    const calculateTotal = (method: PaymentMethod) =>
      obj.reduce((acc, el) => {
        return el.order.payment_method === method ? acc + el.total : acc;
      }, 0);

    const revenue = obj.reduce((acc, el) => acc + el.total, 0);

    const costsTotal =
      groupedCosts[key]?.reduce((acc, el) => acc + el.sum, 0) || 0;

    const stripe = parseFloat(
      (calculateTotal(PaymentMethod.stripe) * 0.029 + 0.3).toFixed(2)
    );

    return {
      date: dayjs(key).startOf('month').toDate(),
      cash: calculateTotal(PaymentMethod.cash),
      card: calculateTotal(PaymentMethod.stripe),
      stripe,
      revenue,
      beg: obj.filter((el) => el.product.name === NameOfClass.BEGINNER).length,
      adv: obj.filter((el) => el.product.name === NameOfClass.ADV).length,
      students: obj.length,
      profit: revenue - costsTotal - stripe,
      costs: groupedCosts[key]
    };
  });
};
