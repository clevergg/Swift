import { SetMetadata } from '@nestjs/common';
import { Role } from '@swift/db';

// Ключ, под которым храним требуемую роль в метаданных роута.
// RolesGuard будет читать метаданные по этому ключу.
export const ROLES_KEY = 'required_role';

/**
 * @Roles(Role.ADMIN) — декоратор, помечающий минимальную роль для эндпоинта.
 *
 * Как работает: SetMetadata записывает значение (требуемую роль) в метаданные
 * обработчика. RolesGuard потом через Reflector читает эти метаданные и
 * сравнивает с ролью юзера в workspace.
 *
 * Передаём ОДНУ минимальную роль (не список) — благодаря иерархии "роль и выше"
 * указание ADMIN автоматически пропускает и OWNER (он старше).
 *
 * Использование:
 *   @Roles(Role.ADMIN)
 *   @Delete(':boardId')
 *   deleteBoard() { ... }
 */
export const Roles = (role: Role): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, role);
