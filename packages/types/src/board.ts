import { z } from 'zod';


import { PrioritySchema } from './enums'
// Board
export const CreateBoardSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100),
});
export type CreateBoardDto = z.infer<typeof CreateBoardSchema>;

export const UpdateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});
export type UpdateBoardDto = z.infer<typeof UpdateBoardSchema>;

// Column 
export const CreateColumnSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100),
});
export type CreateColumnDto = z.infer<typeof CreateColumnSchema>;

export const UpdateColumnSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});
export type UpdateColumnDto = z.infer<typeof UpdateColumnSchema>;

// Card
export const CreateCardSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен').max(200),
  description: z.string().max(5000).optional(),
  priority: PrioritySchema.optional(),
  assigneeId: z.string().uuid().optional(),
});
export type CreateCardDto = z.infer<typeof CreateCardSchema>;

export const UpdateCardSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  priority: PrioritySchema.optional(),
  // null - снять назначение, string - назначить, undefined - не трогать.
  assigneeId: z.string().uuid().nullable().optional(),
});
export type UpdateCardDto = z.infer<typeof UpdateCardSchema>;

// Перемещение карточки (drag-and-drop)
// Карточку перемещают в колонку targetColumnId, между карточками
// beforeCardId и afterCardId (любая может отсутствовать - край колонки).
export const MoveCardSchema = z.object({
  targetColumnId: z.string().uuid(),
  // Соседи в целевой позиции - для вычисления новой позиции (среднее).
  beforeCardId: z.string().uuid().nullable().optional(),
  afterCardId: z.string().uuid().nullable().optional(),
});
export type MoveCardDto = z.infer<typeof MoveCardSchema>;
