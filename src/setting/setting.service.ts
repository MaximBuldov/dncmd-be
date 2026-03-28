import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.setting.findMany();
  }

  async findOne(id: number) {
    const setting = await this.prisma.setting.findUnique({
      where: { id }
    });

    if (!setting) throw new NotFoundException(`Setting not found`);

    return setting;
  }

  async create({ key, value }: CreateSettingDto) {
    return this.prisma.setting.create({
      data: { key, value }
    });
  }

  async update(id: number, { value }: UpdateSettingDto) {
    return this.prisma.setting.update({
      where: { id },
      data: { value }
    });
  }

  async remove(id: number) {
    return this.prisma.setting.delete({
      where: { id }
    });
  }
}
