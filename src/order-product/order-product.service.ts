import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { CouponService } from 'src/coupon/coupon.service';
import {
  DiscountType,
  OrderStatus,
  ProductStatus
} from 'src/generated/prisma/client';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';
import { UpdateOrderProductDto } from './dto/update-order-product.dto';

@Injectable()
export class OrderProductService {
  constructor(
    private prisma: PrismaService,
    private couponService: CouponService,
    private mailService: MailService
  ) {}

  async update(id: number, { productStatus }: UpdateOrderProductDto) {
    const existing = await this.prisma.orderProduct.findUnique({
      where: { id },
      select: { productStatus: true }
    });

    const res = await this.prisma.orderProduct.update({
      where: { id },
      data: { productStatus },
      include: {
        product: true,
        order: true,
        user: { select: { first_name: true, last_name: true, email: true } }
      }
    });

    if (
      productStatus === ProductStatus.canceled &&
      existing?.productStatus !== ProductStatus.canceled
    ) {
      await this.prisma.product.update({
        where: { id: res.product_id },
        data: { stock_quantity: { increment: 1 } }
      });
      this.mailService.cancelClass(res.user, res.product);
    }

    const isDeadline = dayjs().isBefore(
      dayjs(res.product.date_time).subtract(5, 'hour')
    );
    const isPaid = res.order.status === OrderStatus.completed;

    if (isDeadline && isPaid) {
      await this.couponService.create({
        code: `res${res.order_id}${res.user_id}${res.product_id}`,
        amount: 0,
        discount_type: DiscountType.credit,
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
