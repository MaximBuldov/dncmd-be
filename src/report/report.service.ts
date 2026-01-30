import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { OrderStatus } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateCostDto } from './dto/create-report.dto';
import { UpdateCostDto } from './dto/update-report.dto';
import { createReport } from './utils/create-report';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCostDto[]) {
    return await this.prisma.cost.createManyAndReturn({ data });
  }

  async findAll({ from, to }: { from: string; to: string }) {
    const products = await this.prisma.orderProduct.findMany({
      where: {
        order: {
          status: {
            in: [
              OrderStatus.completed,
              OrderStatus.pending,
              OrderStatus.completed
            ]
          }
        },
        product: {
          date_time: {
            gte: dayjs(from).toDate(),
            lte: dayjs(to).endOf('month').toDate()
          }
        }
      },
      include: {
        product: true,
        order: {
          include: {
            coupons: true
          }
        }
      }
    });

    const costs = await this.prisma.cost.findMany({
      where: {
        date: {
          gte: dayjs(from).toDate(),
          lte: dayjs(to).endOf('month').toDate()
        }
      }
    });

    const reports = createReport(products, costs);

    return reports;
  }

  async update(data: UpdateCostDto[]) {
    const withId = data.filter((el) => !!el.id);
    const withoutId = data.filter((el) => !el.id);

    await this.prisma.cost.deleteMany({
      where: {
        id: {
          notIn: withId.map((el) => el.id)
        },
        date: {
          gte: dayjs(data[0].date).startOf('month').toDate(),
          lte: dayjs(data[0].date).endOf('month').toDate()
        }
      }
    });

    const updatedCosts = await this.prisma.$transaction(
      withId.map((cost) =>
        this.prisma.cost.update({ where: { id: cost.id }, data: cost })
      )
    );

    const newCosts = await this.prisma.cost.createManyAndReturn({
      data: withoutId.map(({ name, sum, date }) => ({ name, sum, date }))
    });

    return [...updatedCosts, ...newCosts];
  }
}
