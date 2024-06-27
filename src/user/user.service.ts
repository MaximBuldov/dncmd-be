import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { returnUserObject } from './return-user.object';

interface IFindAll {
  page?: number;
  per_page?: number;
  search?: string;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll({ page, per_page, search }: IFindAll) {
    const skip = (+page - 1) * +per_page;
    const where: Prisma.UserWhereInput = {
      role: 'customer',
      OR: [
        {
          last_name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          first_name: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    };
    return await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        take: +per_page,
        skip,
        orderBy: { created_at: 'desc' }
      }),
      this.prisma.user.count({ where })
    ]);
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: returnUserObject
    });
  }

  async update(id: number, data: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id },
      data
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
