import { Prisma } from 'src/generated/prisma/client';

export const returnUserObject: Prisma.UserSelect = {
  id: true,
  email: true,
  first_name: true,
  last_name: true,
  password: false,
  billing_phone: true,
  created_at: true,
  dob: true,
  instagram: true,
  role: true
};
