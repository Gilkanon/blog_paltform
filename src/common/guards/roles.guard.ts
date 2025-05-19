import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { hasAccess } from '../utils/role-hierarchy';
import JwtPayload from 'src/auth/interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    const { username } = request.params;

    if (!user || !user.role) {
      throw new ForbiddenException('User not found or role not assigned');
    }

    if (hasAccess(user.role, requiredRoles, username, user.username)) {
      return true;
    }

    throw new ForbiddenException(`Access denied`);
  }
}
