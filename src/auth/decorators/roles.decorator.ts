import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/generated/prisma/client';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
