import { type PipeTransform, type ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodError, type ZodSchema } from 'zod';

/**
 * ZodValidationPipe — наша кастомная pipe для валидации входящих данных
 * через Zod-схемы из @swift/types.
 *
 * ЗАЧЕМ ОНА НУЖНА:
 * NestJS из коробки валидирует через class-validator (декораторы на классах).
 * Но у нас единый источник истины — Zod-схемы в @swift/types, которые
 * используются и на фронте. Чтобы валидировать теми же схемами в API,
 * нужна прослойка, которая берёт Zod-схему и проверяет ей данные. Это она.
 *
 * КАК РАБОТАЕТ pipe в NestJS:
 * Pipe стоит между HTTP-запросом и обработчиком контроллера. NestJS вызывает
 * метод transform(), передавая туда сырые данные из запроса. Что вернёт
 * transform() — то и попадёт в контроллер. Если transform() кинет исключение —
 * запрос отклоняется с ошибкой, до контроллера не дойдёт.
 */
export class ZodValidationPipe implements PipeTransform {
  // В конструктор передаём конкретную Zod-схему, которой валидируем.
  // Каждый эндпоинт использует свою: new ZodValidationPipe(RegisterSchema).
  constructor(private readonly schema: ZodSchema) {}

  /**
   * transform вызывается NestJS автоматически для каждого запроса.
   * @param value — сырые данные из запроса (тело, query, params)
   * @param _metadata — инфо о том, что валидируется (тело/query/...). Нам не нужно.
   */
  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    try {
      // schema.parse — сердце валидации. Zod проверяет value по схеме:
      //  - если данные валидны → возвращает их (возможно, преобразованные:
      //    например, строку "5" Zod может привести к числу, если схема так задана)
      //  - если данные невалидны → выбрасывает ZodError
      return this.schema.parse(value);
    } catch (error) {
      // Ловим именно ZodError, чтобы превратить его в понятную HTTP-ошибку 400.
      if (error instanceof ZodError) {
        // Превращаем технические issues Zod в читаемый список ошибок:
        // [{ field: "email", message: "Некорректный email" }, ...]
        const details = error.issues.map((issue) => ({
          // path — массив пути к полю (например ["address", "city"]).
          // Склеиваем точкой для читаемости, либо "(root)" если путь пустой.
          field: issue.path.length > 0 ? issue.path.join('.') : '(root)',
          message: issue.message,
        }));

        // BadRequestException — встроенное исключение NestJS, даёт HTTP 400.
        // Передаём структурированный объект — он попадёт в тело ответа.
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Ошибка валидации входных данных',
          details,
        });
      }
      // Не-Zod ошибки пробрасываем дальше (не наша зона ответственности).
      throw error;
    }
  }
}
