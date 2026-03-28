import { Module } from '@nestjs/common';
import { BundleModule } from 'src/bundle/bundle.module';
import { CouponModule } from 'src/coupon/coupon.module';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';
import { ProductService } from 'src/product/product.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [CouponModule, BundleModule],
  controllers: [OrderController],
  providers: [OrderService, PrismaService, MailService, ProductService]
})
export class OrderModule {}
