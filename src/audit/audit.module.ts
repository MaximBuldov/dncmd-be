import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuditService } from './audit.service';

@Global()
@Module({
  providers: [AuditService, PrismaService],
  exports: [AuditService]
})
export class AuditModule {}
