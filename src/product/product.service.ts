import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { PrismaService } from 'prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductDto) {
    return this.prisma.product.create({ data });
  }

  async createMany(data: CreateProductDto[]) {
    return this.prisma.product.createManyAndReturn({ data });
  }

  async findAll(month?: string) {
    const where = month
      ? {
          date_time: {
            gte: dayjs(month, 'YYYY-MM').startOf('month').toDate(),
            lte: dayjs(month, 'YYYY-MM').endOf('month').toDate()
          }
        }
      : undefined;

    return await this.prisma.product.findMany({
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
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, data: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data
    });
  }

  async remove(id: number) {
    return await this.prisma.product.delete({ where: { id } });
  }
}
