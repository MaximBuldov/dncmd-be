import { Module } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';

@Module({
  controllers: [CouponController],
  providers: [CouponService, PrismaService, MailService]
})
export class CouponModule {}
