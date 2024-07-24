import {
  Coupon,
  Order,
  OrderProduct,
  PaymentMethod,
  Product,
  Report,
  ReportCost
} from '@prisma/client';
import * as dayjs from 'dayjs';

enum NameOfClass {
  BEGINNER = 'Beginner',
  ADV = 'Int/Adv',
  CUSTOM = 'Custom'
}

interface ReportExtended extends Report {
  costs?: ReportCost[];
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

export const createReport = (
  arr: OrderProductExtended[],
  reports: ReportExtended[]
): Partial<Report>[] => {
  const goupedProducts = arr.reduce<GroupedProducts>((acc, obj) => {
    const yearMonth = dayjs(obj.product.date_time).format('YYYY-MM');
    if (!acc[yearMonth]) acc[yearMonth] = [];
    acc[yearMonth].push(obj);

    return acc;
  }, {});

  return Object.entries(goupedProducts).map(([key, obj]) => {
    const calculateTotal = (method: PaymentMethod) =>
      obj.reduce((acc, el) => {
        return el.order.payment_method === method ? acc + el.total : acc;
      }, 0);
    return {
      date: dayjs(key).toDate(),
      cash: calculateTotal(PaymentMethod.cash),
      card: calculateTotal(PaymentMethod.stripe),
      stripe: parseFloat(
        (calculateTotal(PaymentMethod.stripe) * 0.029 + 0.3).toFixed(2)
      ),
      revenue: obj.reduce((acc, el) => acc + el.total, 0),
      beg: obj.filter((el) => el.product.name === NameOfClass.BEGINNER).length,
      adv: obj.filter((el) => el.product.name === NameOfClass.ADV).length,
      students: obj.length,
      profit: 0,
      costs:
        reports.find((el) => dayjs(el.date).format('YYYY-MM') === key)?.costs ||
        []
    };
  });
};
