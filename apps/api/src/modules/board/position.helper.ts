// Логика float-позиций для упорядочивания (колонки, карточки).
//
// Идея: позиция - дробное число. Между соседями A (pos 1000) и B (pos 2000)
// вставляем со средним (1500). Перемещение = одно обновление. См. ADR-0003.

// Шаг между позициями при равномерной раздаче (ребаланс, добавление в конец).
export const POSITION_STEP = 1000;

// Минимальный безопасный зазор. Если промежуток между соседями меньше -
// нужен ребаланс (float упёрся в предел точности).
const MIN_GAP = 0.0001;

/**
 * Вычисляет позицию между двумя соседями.
 *
 * @param before — позиция соседа слева/сверху (null — вставка в начало)
 * @param after — позиция соседа справа/снизу (null — вставка в конец)
 * @returns новая позиция ИЛИ null, если промежуток схлопнулся (нужен ребаланс)
 */
export function calculatePosition(
  before: number | null,
  after: number | null,
): number | null {
  // В начало пустого списка.
  if (before === null && after === null) {
    return POSITION_STEP;
  }
  // В начало (перед первым): половина позиции первого.
  if (before === null && after !== null) {
    return after / 2;
  }
  // В конец (после последнего): позиция последнего + шаг.
  if (before !== null && after === null) {
    return before + POSITION_STEP;
  }
  // Между двумя: среднее.
  if (before !== null && after !== null) {
    const gap = after - before;
    // Промежуток схлопнулся — float упёрся в предел, нужен ребаланс.
    if (gap < MIN_GAP) {
      return null;
    }
    return before + gap / 2;
  }
  return null;
}

/**
 * Пересчитывает позиции для ребаланса - раздаёт равномерно (step, 2*step, ...).
 * Вызывается, когда промежуток схлопнулся. Принимает упорядоченный список id,
 * возвращает map id -> новая позиция.
 *
 * @param orderedIds — id в желаемом порядке
 */
export function rebalancePositions(orderedIds: string[]): Map<string, number> {
  const result = new Map<string, number>();
  orderedIds.forEach((id, index) => {
    result.set(id, (index + 1) * POSITION_STEP);
  });
  return result;
}
