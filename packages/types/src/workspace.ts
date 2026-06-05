import { z } from 'zod';

import { RoleSchema } from './enums';
// Схемы для workspace и участников. Единый источник истины фронт+бэк.

// slug — человекочитаемый идентификатор в URL (my-team вместо uuid).
// Разрешаем строчные буквы, цифры, дефис.
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Создание workspace.
export const CreateWorkspaceSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100),
  slug: z
    .string()
    .min(2, 'Slug минимум 2 символа')
    .max(50)
    .regex(slugRegex, 'Slug: строчные буквы, цифры, дефис'),
});
export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceSchema>;

// Обновление workspace (всё опционально — меняем что прислали).
export const UpdateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(2).max(50).regex(slugRegex).optional(),
});
export type UpdateWorkspaceDto = z.infer<typeof UpdateWorkspaceSchema>;

// Добавление участника по email (существующего юзера).
export const AddMemberSchema = z.object({
  email: z.string().email('Некорректный email'),
  role: RoleSchema,
});
export type AddMemberDto = z.infer<typeof AddMemberSchema>;

// Смена роли участника.
export const UpdateMemberRoleSchema = z.object({
  role: RoleSchema,
});
export type UpdateMemberRoleDto = z.infer<typeof UpdateMemberRoleSchema>;
