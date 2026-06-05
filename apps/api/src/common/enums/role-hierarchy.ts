import { Role } from '@swift/db';

// Числовые веса ролей для иерархии. Чем больше число - тем больше прав.
// OWNER > ADMIN > MEMBER > VIEWER.
const ROLE_WEIGHT: Record<Role, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

/**
 * Проверяет, достаточно ли роли юзера для требуемой (по иерархии "роль и выше").
 *
 * Пример: требуется ADMIN (вес 3).
 *  - юзер OWNER (вес 4) → 4 >= 3 → true (старший проходит)
 *  - юзер ADMIN (вес 3) → 3 >= 3 → true
 *  - юзер MEMBER (вес 2) → 2 >= 3 → false (младший не проходит)
 *
 * @param userRole — роль юзера в workspace
 * @param requiredRole — минимальная требуемая роль
 */
export function hasRequiredRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_WEIGHT[userRole] >= ROLE_WEIGHT[requiredRole];
}
