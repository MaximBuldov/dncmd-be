import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { CouponModule } from './coupon/coupon.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { ReportModule } from './report/report.module';
import { UserModule } from './user/user.module';
import { OrderProductModule } from './order-product/order-product.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    ProductModule,
    UserModule,
    ReportModule,
    OrderModule,
    CouponModule,
    CategoryModule,
    OrderProductModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
