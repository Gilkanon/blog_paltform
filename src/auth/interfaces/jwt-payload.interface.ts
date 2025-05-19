import { Role } from '@prisma/client';

export default interface JwtPayload {
  username: string;
  role: Role;
}
