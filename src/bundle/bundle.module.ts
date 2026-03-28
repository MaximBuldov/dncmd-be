import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { BundleController } from './bundle.controller';
import { BundleService } from './bundle.service';

@Module({
  controllers: [BundleController],
  providers: [BundleService, PrismaService],
  exports: [BundleService]
})
export class BundleModule {}
