import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { TemplateController } from './template.controller';
import { TemplateService } from './template.service';

@Module({
  controllers: [TemplateController],
  providers: [TemplateService, PrismaService]
})
export class TemplateModule {}
