// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { Order, OrderProduct, Product, User } from '@prisma/client';
import * as sgMail from '@sendgrid/mail';
import * as dayjs from 'dayjs';
import { readFileSync } from 'fs';
import handlebars from 'handlebars';
import { join } from 'path';

interface OrderProductWithName extends OrderProduct {
  product: Pick<Product, 'name' | 'date_time'>;
}

interface OrderWithItems extends Order {
  line_items: OrderProductWithName[];
}

@Injectable()
export class MailService {
  constructor() {
    sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
  }
  private loadTemplate(templateName: string, context: any): string {
    const templateDir =
      process.env.TEMPLATES_DIR || join(__dirname, 'templates');
    const templatePath = join(templateDir, `${templateName}.html`);
    const source = readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);
    return template(context);
  }
  async sendMail(to: string, subject: string, data: any, template: string) {
    const html = this.loadTemplate(template, data);
    const msg = {
      to,
      from: process.env.EMAIL,
      subject,
      html
    };

    await sgMail.send(msg);
  }

  async newOrder(email: string, order: OrderWithItems, user: User) {
    await this.sendMail(
      email,
      `New Order #${order.id} - Dance Mode`,
      {
        orderId: order.id,
        orderDate: dayjs(order.created_at).format('MM/DD/YYYY'),
        customer: {
          name: `${user.first_name} ${user.last_name}`,
          phone: user.billing_phone,
          email: user.email
        },
        products: order.line_items.map((el) => ({
          name: el.product.name,
          date_time: dayjs(el.product.date_time).format('MM/DD/YYYY ha'),
          total: el.total
        })),
        subtotal: `$${order.subtotal}`,
        discount: `$${order.subtotal - order.total}`,
        total: `$${order.total}`
      },
      'new-order'
    );
  }

  async welcome(email: string, name: string) {
    await this.sendMail(
      email,
      'Welcome to the Dance Mode Family',
      { name },
      'welcome'
    );
  }

  async newStudent(user: User) {
    await this.sendMail(
      process.env.EMAIL,
      'New Student - Dance Mode',
      {
        name: `${user.first_name} ${user.last_name}`,
        phone: user.billing_phone,
        insta: user.instagram,
        dob: dayjs(user.dob).format('MM/DD/YYYY'),
        email: user.email
      },
      'new-user'
    );
  }

  async coupon(user: Pick<User, 'email' | 'first_name'>, code: string) {
    await this.sendMail(
      user.email,
      'New Coupon - Dance Mode',
      {
        name: user.first_name,
        code
      },
      'coupon'
    );
  }

  async resetPassword(user: User, link: string) {
    await this.sendMail(
      user.email,
      'Reset Password - Dance Mode',
      {
        name: user.first_name,
        link
      },
      'reset-password'
    );
  }
}
