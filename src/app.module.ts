import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BundleModule } from './bundle/bundle.module';
import { CouponModule } from './coupon/coupon.module';
import { MailModule } from './mail/mail.module';
import { OrderProductModule } from './order-product/order-product.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { TemplateModule } from './template/template.module';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    ProductModule,
    UserModule,
    OrderModule,
    CouponModule,
    OrderProductModule,
    MailModule,
    TemplateModule,
    BundleModule,
    CategoryModule
  ],
  controllers: [AppController],
  providers: [AppService, Logger]
})
export class AppModule {}
