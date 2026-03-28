import { Module } from '@nestjs/common';
import { BundleModule } from 'src/bundle/bundle.module';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';

@Module({
  imports: [BundleModule],
  controllers: [CouponController],
  providers: [CouponService, PrismaService, MailService],
  exports: [CouponService]
})
export class CouponModule {}
