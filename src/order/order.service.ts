import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateOrderDto, customer_id: number) {
    const total = data.line_items.reduce((acc, el) => acc + el.total, 0);
    const subtotal = data.line_items.reduce((acc, el) => acc + el.subtotal, 0);
    return await this.prisma.order.create({
      data: {
        ...data,
        total,
        subtotal,
        customer: {
          connect: { id: customer_id }
        },
        line_items: {
          createMany: {
            data: data.line_items.map((el) => ({
              ...el,
              user_id: customer_id
            }))
          }
        },
        coupons: {
          connect: data.coupons.map((el) => ({ id: el.id }))
        }
      },
      include: {
        line_items: true
      }
    });
  }

  async findAll({
    per_page,
    page,
    customer,
    before,
    after,
    status
  }: OrderQueryDto) {
    const skip = (+page - 1) * +per_page;

    const where: Prisma.OrderWhereInput = {
      customer_id: customer,
      created_at: {
        lte: before,
        gte: after
      },
      status: {
        in: status
      }
    };

    return await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        take: +per_page,
        skip,
        orderBy: { created_at: 'desc' },
        include: {
          line_items: {
            include: {
              product: {
                select: {
                  name: true
                }
              }
            }
          },
          coupons: true,
          customer: {
            select: {
              first_name: true,
              last_name: true
            }
          }
        }
      }),
      this.prisma.order.count({ where })
    ]);
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  async update(id: number, data: UpdateOrderDto) {
    const order = await this.prisma.order.update({
      where: { id },
      data,
      include: {
        line_items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        },
        coupons: true,
        customer: {
          select: {
            first_name: true,
            last_name: true
          }
        }
      }
    });

    // if (data.status && order) {
    //   const status = data.status;
    //   const id = order.customer_id;
    //   await Promise.all(
    //     order.line_items.map(async ({ product_id }) => {
    //       const product = await this.prisma.product.findUnique({
    //         where: { id: product_id }
    //       });

    //       await this.prisma.product.update({
    //         where: { id: product_id },
    //         data: {
    //           pending:
    //             status === OrderStatus.processing
    //               ? { push: id }
    //               : product.pending.filter((el) => el !== id),
    //           paid:
    //             status === OrderStatus.completed
    //               ? { push: id }
    //               : product.paid.filter((el) => el !== id),
    //           cancel:
    //             status === OrderStatus.cancelled
    //               ? { push: id }
    //               : product.cancel.filter((el) => el !== id)
    //         }
    //       });
    //     })
    //   );
    // }

    return order;
  }

  async remove(id: number) {
    const [order] = await Promise.all([
      this.prisma.order.delete({ where: { id } }),
      this.prisma.orderProduct.deleteMany({
        where: { order_id: id }
      })
    ]);

    return order;
  }
}
