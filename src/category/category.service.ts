import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryDto) {
    return await this.prisma.category.create({ data });
  }

  async update(id: number, name: string) {
    return await this.prisma.category.update({ where: { id }, data: { name } });
  }

  async remove(id: number) {
    return await this.prisma.category.delete({ where: { id } });
  }

  async getAll(page: number, per_page: number = 10) {
    const skip = (+page - 1) * +per_page;

    return await this.prisma.$transaction([
      this.prisma.category.findMany({
        take: +per_page,
        skip
      }),
      this.prisma.category.count()
    ]);
  }
}
