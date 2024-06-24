import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { ReportModule } from './report/report.module';
import { OrderModule } from './order/order.module';
import { CouponModule } from './coupon/coupon.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, ProductModule, UserModule, ReportModule, OrderModule, CouponModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
