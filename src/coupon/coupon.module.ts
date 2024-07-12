import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { MailService } from 'src/mail/mail.service';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';

@Module({
  controllers: [CouponController],
  providers: [CouponService, PrismaService, MailService]
})
export class CouponModule {}
