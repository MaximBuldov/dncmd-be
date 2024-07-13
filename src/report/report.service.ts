import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { PrismaService } from 'src/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}
  create(createReportDto: CreateReportDto) {
    return 'This action adds a new report';
  }

  async findAll({ from, to }: { from: string; to: string }) {
    return await this.prisma.report.findMany({
      where: {
        date: {
          gte: dayjs(from).toDate(),
          lte: dayjs(to).toDate()
        }
      }
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }
}
