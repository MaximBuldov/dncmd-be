import { Module } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';
import { OrderProductController } from './order-product.controller';
import { OrderProductService } from './order-product.service';
import { CouponService } from 'src/coupon/coupon.service';

@Module({
  controllers: [OrderProductController],
  providers: [OrderProductService, PrismaService, CouponService]
})
export class OrderProductModule {}
