import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { OrderProductController } from './order-product.controller';
import { OrderProductService } from './order-product.service';

@Module({
  controllers: [OrderProductController],
  providers: [OrderProductService, PrismaService]
})
export class OrderProductModule {}
