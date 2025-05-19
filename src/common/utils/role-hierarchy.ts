import { Role } from '@prisma/client';

const roleHierarchy: Role[] = [Role.USER, Role.MODERATOR, Role.ADMIN];

export function hasAccess(
  userRole: Role,
  requiredRoles: Role[],
  username?: string,
  currentUsername?: string,
): boolean {
  if (username && currentUsername && username === currentUsername) {
    return true;
  }

  const userRoleIndex = roleHierarchy.indexOf(userRole);
  return requiredRoles.some(
    (role) => roleHierarchy.indexOf(role) <= userRoleIndex,
  );
}
