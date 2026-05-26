import { z } from 'zod';

/**
 * Роли участника в workspace.
 * Иерархия: OWNER > ADMIN > MEMBER > VIEWER
 *
 * Определяем через Zod enum — получаем И рантайм-валидацию, И TS-тип разом.
 */
export const RoleSchema = z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);
export type Role = z.infer<typeof RoleSchema>;

/**
 * Числовой вес роли для сравнения прав.
 * Используется в RBAC guard: если требуется ADMIN (вес 2),
 * то OWNER (вес 3) тоже проходит.
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
  VIEWER: 0,
};

/**
 * Приоритет карточки на канбан-доске.
 */
export const PrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type Priority = z.infer<typeof PrioritySchema>;

/**
 * Типы уведомлений.
 */
export const NotificationTypeSchema = z.enum([
  'CARD_ASSIGNED',
  'CARD_MENTIONED',
  'CARD_DUE_SOON',
  'MEMBER_ADDED',
  'COMMENT_ADDED',
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;
