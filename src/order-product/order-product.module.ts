import { Module } from '@nestjs/common';
import { BundleModule } from 'src/bundle/bundle.module';
import { CouponModule } from 'src/coupon/coupon.module';
import { MailModule } from 'src/mail/mail.module';
import { PrismaService } from 'src/prisma.service';
import { OrderProductController } from './order-product.controller';
import { OrderProductService } from './order-product.service';

@Module({
  imports: [MailModule, CouponModule, BundleModule],
  controllers: [OrderProductController],
  providers: [OrderProductService, PrismaService]
})
export class OrderProductModule {}
