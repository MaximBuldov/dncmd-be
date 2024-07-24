import { Injectable } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import * as dayjs from 'dayjs';
import { PrismaService } from 'src/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create({ wait_list, ...rest }: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...rest,
        wait_list: {
          connect: wait_list.map((id) => ({ id }))
        }
      }
    });
  }

  async createMany(data: CreateProductDto[]) {
    return this.prisma.product.createManyAndReturn({ data });
  }

  async findAll(user: User, month?: string) {
    const where: Prisma.ProductWhereInput = month
      ? {
          date_time: {
            gte: dayjs(month, 'YYYY-MM').startOf('month').toDate(),
            lte: dayjs(month, 'YYYY-MM').endOf('month').toDate()
          },
          orders: {}
        }
      : undefined;

    const products = await this.prisma.product.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      },
      include: {
        orders: {
          include: {
            order: {
              select: {
                status: true
              }
            },
            user: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        }
      }
    });
    if (user?.role === Role.customer) {
      return products.map((product) => ({
        ...product,
        orders: product.orders.filter((order) => order.user_id === user.id)
      }));
    } else if (user?.role === Role.administrator) {
      return products;
    } else {
      return [];
    }
  }

  async update(id: number, { wait_list, ...rest }: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        wait_list: {
          set: wait_list.map((id) => ({ id }))
        }
      }
    });
  }

  async remove(id: number) {
    return await this.prisma.product.delete({ where: { id } });
  }

  async updateProductsAmount(ids: number[], action: 'increment' | 'decrement') {
    await this.prisma.product.updateMany({
      where: { id: { in: ids } },
      data: {
        stock_quantity: {
          [action]: 1
        }
      }
    });
  }
}
