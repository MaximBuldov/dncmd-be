import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { MailService } from 'src/mail/mail.service';
import { ProductService } from 'src/product/product.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService, MailService, ProductService]
})
export class OrderModule {}
