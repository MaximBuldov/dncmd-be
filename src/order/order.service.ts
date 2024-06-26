import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}
  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }

  async findAll({ per_page, page }: any) {
    const skip = (+page - 1) * +per_page;

    return await this.prisma.$transaction([
      this.prisma.order.findMany({
        take: +per_page,
        skip,
        orderBy: { created_at: 'desc' }
      }),
      this.prisma.order.count()
    ]);
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
