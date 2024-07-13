import { Module } from '@nestjs/common';
import { CouponService } from 'src/coupon/coupon.service';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';
import { ProductService } from 'src/product/product.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    PrismaService,
    MailService,
    ProductService,
    CouponService
  ]
})
export class OrderModule {}
