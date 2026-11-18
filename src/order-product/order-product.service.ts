import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import dayjs from 'dayjs';
import { AuditService } from 'src/audit/audit.service';
import { CouponService } from 'src/coupon/coupon.service';
import {
  DiscountType,
  OrderStatus,
  ProductStatus,
  Role,
  User
} from 'src/generated/prisma/client';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';
import { UpdateOrderProductDto } from './dto/update-order-product.dto';

@Injectable()
export class OrderProductService {
  constructor(
    private prisma: PrismaService,
    private couponService: CouponService,
    private mailService: MailService,
    private audit: AuditService
  ) {}

  async update(
    id: number,
    { productStatus }: UpdateOrderProductDto,
    actor: Pick<User, 'id' | 'role'>
  ) {
    const actorId = actor.id;
    const existing = await this.prisma.orderProduct.findUnique({
      where: { id },
      select: { productStatus: true, user_id: true }
    });

    if (!existing) throw new NotFoundException('Class booking not found');

    if (actor.role !== Role.administrator) {
      if (existing.user_id !== actor.id) {
        throw new ForbiddenException('You can only change your own classes');
      }
      if (existing.productStatus === ProductStatus.canceled) {
        throw new ForbiddenException('Canceled class cannot be changed');
      }
    }

    const res = await this.prisma.orderProduct.update({
      where: { id },
      data: { productStatus },
      include: {
        product: true,
        order: true,
        user: { select: { first_name: true, last_name: true, email: true } }
      }
    });

    await this.audit.log({
      actorId,
      action: 'order_product.status',
      entity: 'order_product',
      entityId: id,
      data: {
        from: existing.productStatus ?? null,
        to: productStatus ?? null,
        user_id: res.user_id,
        product_id: res.product_id,
        order_id: res.order_id
      }
    });

    const isNewlyCanceled =
      productStatus === ProductStatus.canceled &&
      existing.productStatus !== ProductStatus.canceled;

    if (!isNewlyCanceled) return res;

    await this.prisma.product.update({
      where: { id: res.product_id },
      data: { stock_quantity: { increment: 1 } }
    });
    this.mailService.cancelClass(res.user, res.product);

    const isDeadline = dayjs().isBefore(
      dayjs(res.product.date_time).subtract(5, 'hour')
    );
    const isPaid = res.order.status === OrderStatus.completed;

    if (isDeadline && isPaid) {
      await this.couponService.create(
        {
          code: `res${res.order_id}${res.user_id}${res.product_id}`,
          amount: 0,
          discount_type: DiscountType.credit,
          date_expires: dayjs(res.product.date_time)
            .add(1, 'month')
            .endOf('month')
            .toDate(),
          allowed_users: [res.user_id]
        },
        actorId
      );
    }

    return res;
  }

  async updateMany(
    { productStatus, ids }: UpdateOrderProductDto,
    actorId?: number
  ) {
    const before = await this.prisma.orderProduct.findMany({
      where: { id: { in: ids } },
      select: { id: true, productStatus: true, user_id: true, product_id: true }
    });

    const res = await this.prisma.orderProduct.updateMany({
      where: { id: { in: ids } },
      data: { productStatus }
    });

    await Promise.all(
      before.map((op) =>
        this.audit.log({
          actorId,
          action: 'order_product.status_bulk',
          entity: 'order_product',
          entityId: op.id,
          data: {
            from: op.productStatus ?? null,
            to: productStatus ?? null,
            user_id: op.user_id,
            product_id: op.product_id
          }
        })
      )
    );

    return res;
  }
}
