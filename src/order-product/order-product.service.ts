import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { UpdateOrderProductDto } from './dto/update-order-product.dto';

@Injectable()
export class OrderProductService {
  constructor(private prisma: PrismaService) {}

  async update(id: number, { productStatus }: UpdateOrderProductDto) {
    return await this.prisma.orderProduct.update({
      where: { id },
      data: { productStatus }
    });
  }

  async updateMany({ productStatus, ids }: UpdateOrderProductDto) {
    return await this.prisma.orderProduct.updateMany({
      where: { id: { in: ids } },
      data: { productStatus }
    });
  }
}
