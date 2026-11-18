import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma.service';

export interface AuditEntry {
  actorId?: number | null;
  action: string;
  entity: string;
  entityId?: number | null;
  data?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');

  constructor(private prisma: PrismaService) {}

  /** Records an action. Never throws: auditing must not break the request. */
  async log({ actorId, action, entity, entityId, data }: AuditEntry) {
    this.logger.log(
      JSON.stringify({ actorId, action, entity, entityId, data })
    );
    try {
      await this.prisma.auditLog.create({
        data: {
          actor_id: actorId ?? null,
          action,
          entity,
          entity_id: entityId ?? null,
          data
        }
      });
    } catch (error) {
      this.logger.error(`Failed to write audit log: ${error}`);
    }
  }
}
