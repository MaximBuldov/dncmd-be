import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTemplateDto) {
    return await this.prisma.template.create({ data });
  }

  async update(id: number, data: UpdateTemplateDto) {
    return await this.prisma.template.update({ where: { id }, data });
  }

  async remove(id: number) {
    return await this.prisma.template.delete({ where: { id } });
  }

  async getAll() {
    return await this.prisma.template.findMany();
  }
}
