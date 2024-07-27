import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { returnUserObject } from './return-user.object';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll({ page, per_page, search, all }: UserQueryDto) {
    const skip = all ? undefined : (+page - 1) * +per_page;
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
        take: all ? undefined : +per_page,
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

  async remove(id: number) {
    return await this.prisma.user.delete({
      where: { id }
    });
  }
}
