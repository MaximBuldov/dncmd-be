import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import * as dayjs from 'dayjs';
import { PrismaService } from 'src/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { createReport } from './utils/create-report';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}
  async create({ costs, ...rest }: CreateReportDto) {
    return await this.prisma.report.create({
      data: {
        ...rest,
        costs: {
          create: costs.map(({ date, name, sum }) => ({
            date: dayjs(date).toDate(),
            name,
            sum: parseFloat(sum)
          }))
        }
      },
      include: {
        costs: true
      }
    });
  }

  async findAll({ from, to }: { from: string; to: string }) {
    const reports = await this.prisma.report.findMany({
      where: {
        date: {
          gte: dayjs(from).toDate(),
          lte: dayjs(to).toDate()
        }
      },
      orderBy: { created_at: 'desc' },
      include: {
        costs: true
      }
    });

    const lastReport = reports[0];

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
            gte: lastReport?.completed
              ? dayjs(lastReport?.date).add(1, 'month').toDate()
              : dayjs(lastReport?.date || from).toDate(),
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

    const temporaryReports = createReport(products, reports);

    return [...temporaryReports, ...reports];
  }

  async update(id: number, { costs, ...rest }: UpdateReportDto) {
    return await this.prisma.report.update({
      where: { id },
      data: {
        ...rest,
        costs: {
          set: costs
        }
      },
      include: {
        costs: true
      }
    });
  }

  async remove(id: number) {
    return await this.prisma.report.delete({ where: { id } });
  }
}
