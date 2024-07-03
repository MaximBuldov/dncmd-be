// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { Order, OrderProduct, User } from '@prisma/client';
import * as sgMail from '@sendgrid/mail';
import dayjs from 'dayjs';
import { readFileSync } from 'fs';
import handlebars from 'handlebars';
import { join } from 'path';

interface OrderProductWithName extends OrderProduct {
  product: {
    name: string;
  };
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
          name: el.product.name
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
}
