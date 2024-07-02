import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { UpdateOrderProductDto } from './dto/update-order-product.dto';

@Injectable()
export class OrderProductService {
  constructor(private prisma: PrismaService) {}

  async update(id: number, data: UpdateOrderProductDto) {
    return await this.prisma.orderProduct.update({
      where: { id },
      data
    });
  }

  async updateMany(data: UpdateOrderProductDto) {
    return await this.prisma.orderProduct.updateMany({
      where: { id: { in: data.ids } },
      data: {
        productStatus: data.productStatus
      }
    });
  }
}
