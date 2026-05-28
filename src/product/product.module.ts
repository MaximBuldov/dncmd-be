import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { PrismaService } from 'src/prisma.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [MailModule],
  controllers: [ProductController],
  providers: [ProductService, PrismaService]
})
export class ProductModule {}
