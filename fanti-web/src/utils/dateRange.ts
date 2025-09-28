import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * Verifica se há sobreposição entre os intervalos [startA, endA] e [startB, endB]
 * @param startA string | Date
 * @param endA string | Date
 * @param startB string | Date
 * @param endB string | Date
 * @returns boolean
 */
export function isRangeOverlap(startA: string | Date, endA: string | Date, startB: string | Date, endB: string | Date): boolean {
  const aStart = dayjs(startA);
  const aEnd = dayjs(endA);
  const bStart = dayjs(startB);
  const bEnd = dayjs(endB);
  // Sobrepõe se o início de A for menor ou igual ao fim de B E o fim de A for maior ou igual ao início de B
  return aStart.isSameOrBefore(bEnd, 'day') && aEnd.isSameOrAfter(bStart, 'day');
}
