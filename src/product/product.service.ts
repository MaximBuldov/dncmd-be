import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { Prisma, Role, User } from 'src/generated/prisma/client';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async create(data: CreateProductDto) {
    return this.buildCreateInput(data);
  }

  async createMany(data: CreateProductDto[]) {
    return await this.prisma.$transaction(
      data.map((dto) => this.buildCreateInput(dto))
    );
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
        },
        categories: true,
        wait_list: { select: { id: true, first_name: true, last_name: true } }
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

  async update(
    id: number,
    { wait_list, categories, ...rest }: UpdateProductDto
  ) {
    return await this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        wait_list: {
          set: wait_list.map((id) => ({ id }))
        },
        categories: {
          set: categories.map((id) => ({ id }))
        }
      }
    });
  }

  async remove(id: number) {
    return await this.prisma.product.delete({ where: { id } });
  }

  async joinWaitList(productId: number, user: User) {
    const product = await this.prisma.product.update({
      where: { id: productId },
      data: { wait_list: { connect: { id: user.id } } },
      include: {
        categories: true,
        wait_list: { select: { id: true, first_name: true, last_name: true } }
      }
    });
    this.mailService.waitList(user, product);
    return product;
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

  private buildCreateInput({
    categories = [],
    wait_list = [],
    ...rest
  }: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...rest,
        wait_list: { connect: wait_list.map((id) => ({ id })) },
        categories: { connect: categories.map((id) => ({ id })) }
      },
      include: {
        categories: true
      }
    });
  }
}
