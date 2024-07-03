import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma, User } from '@prisma/client';
import { PrismaService } from 'prisma.service';
import { MailService } from 'src/mail/mail.service';
import Stripe from 'stripe';
import { CreateIntentDto } from './dto/create-intent.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderDto, UpdateStripeOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async create(data: CreateOrderDto, user: User) {
    const total = data.line_items.reduce((acc, el) => acc + el.total, 0);
    const subtotal = data.line_items.reduce((acc, el) => acc + el.subtotal, 0);

    if (total < 0.5) throw new Error('Amount must be at least 50 cents');

    const order = await this.prisma.order.create({
      data: {
        ...data,
        total,
        subtotal,
        customer: {
          connect: { id: +user.id }
        },
        line_items: {
          createMany: {
            data: data.line_items.map((el) => ({
              ...el,
              user_id: +user.id
            }))
          }
        },
        coupons: {
          connect: data.coupons.map((el) => ({ id: el.id }))
        }
      },
      include: {
        line_items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    [process.env.EMAIL, user.email].forEach(async (email) => {
      this.mailService.newOrder(email, order, user);
    });

    return order;
  }

  async createIntent({ total }: CreateIntentDto) {
    if (total < 0.5) throw new Error('Amount must be at least 50 cents');

    const totalInCents = Math.round(total) * 100;

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: totalInCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true
      }
    });

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret
    };
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

    return order;
  }

  async updateStripe({ payment_intent }: UpdateStripeOrderDto) {
    const order = await this.prisma.order.update({
      where: { stripe_id: payment_intent },
      data: {
        status: OrderStatus.completed
      }
    });
    return order.id;
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
