import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import * as dayjs from 'dayjs';
import { CouponService } from 'src/coupon/coupon.service';
import { PrismaService } from 'src/prisma.service';
import { UpdateOrderProductDto } from './dto/update-order-product.dto';

@Injectable()
export class OrderProductService {
  constructor(
    private prisma: PrismaService,
    private couponService: CouponService
  ) {}

  async update(id: number, { productStatus }: UpdateOrderProductDto) {
    const res = await this.prisma.orderProduct.update({
      where: { id },
      data: { productStatus },
      include: {
        product: true,
        order: true
      }
    });

    const isDeadline = dayjs().isBefore(
      dayjs(res.product.date_time).subtract(5, 'hour')
    );
    const isPaid = res.order.status === OrderStatus.completed;

    if (isDeadline && isPaid) {
      await this.couponService.create({
        code: `reschedule${res.order_id}${res.user_id}${res.product_id}`,
        amount: res.total,
        discount_type: 'fixed_cart',
        date_expires: dayjs(res.product.date_time)
          .add(1, 'month')
          .endOf('month')
          .toDate(),
        allowed_users: [res.user_id]
      });
    }

    return res;
  }

  async updateMany({ productStatus, ids }: UpdateOrderProductDto) {
    return await this.prisma.orderProduct.updateMany({
      where: { id: { in: ids } },
      data: { productStatus }
    });
  }
}
