import { Module } from '@nestjs/common';
import { CouponService } from 'src/coupon/coupon.service';
import { MailModule } from 'src/mail/mail.module';
import { PrismaService } from 'src/prisma.service';
import { OrderProductController } from './order-product.controller';
import { OrderProductService } from './order-product.service';

@Module({
  imports: [MailModule],
  controllers: [OrderProductController],
  providers: [OrderProductService, PrismaService, CouponService]
})
export class OrderProductModule {}
