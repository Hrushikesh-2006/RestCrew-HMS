import type { Meal, MealParticipation } from '@prisma/client';

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;
const HOSTEL_TIMEZONE_OFFSET_MINUTES = 330;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type MealType = (typeof MEAL_TYPES)[number];

const mealTypeOrder: Record<MealType, number> = {
  breakfast: 0,
  lunch: 1,
  dinner: 2,
};

type StudentMealRecord = Meal & {
  participations: Pick<MealParticipation, 'willAttend'>[];
};

type OwnerMealRecord = Meal & {
  _count: {
    participations: number;
  };
};

export function isMealType(value: string): value is MealType {
  return (MEAL_TYPES as readonly string[]).includes(value);
}

export function normalizeMenuItems(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

export function parseMealMenu(menu: string): string[] {
  try {
    return normalizeMenuItems(JSON.parse(menu));
  } catch {
    return [];
  }
}

export function parseDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const calendarDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const parsed = new Date(calendarDate.getTime() - HOSTEL_TIMEZONE_OFFSET_MINUTES * 60 * 1000);

  if (
    Number.isNaN(calendarDate.getTime()) ||
    calendarDate.getUTCFullYear() !== Number(year) ||
    calendarDate.getUTCMonth() !== Number(month) - 1 ||
    calendarDate.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return parsed;
}

export function formatDateInput(value: Date) {
  return new Date(value.getTime() + HOSTEL_TIMEZONE_OFFSET_MINUTES * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

export function getUtcDayRange(value: string) {
  const date = parseDateInput(value);

  if (!date) {
    return null;
  }

  const start = new Date(date);
  const end = new Date(start.getTime() + DAY_IN_MS - 1);

  return { start, end, date };
}

export function getUtcWeekRange(value: string) {
  const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!date) {
    return null;
  }

  const [, year, month, day] = date;
  const calendarDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const weekStartCalendar = new Date(calendarDate);
  weekStartCalendar.setUTCDate(weekStartCalendar.getUTCDate() - weekStartCalendar.getUTCDay());

  const weekEndCalendar = new Date(weekStartCalendar);
  weekEndCalendar.setUTCDate(weekEndCalendar.getUTCDate() + 6);

  const start = parseDateInput(weekStartCalendar.toISOString().slice(0, 10));
  const weekEndStart = parseDateInput(weekEndCalendar.toISOString().slice(0, 10));

  if (!start || !weekEndStart) {
    return null;
  }

  const end = new Date(weekEndStart.getTime() + DAY_IN_MS - 1);

  return { start, end };
}

export function compareMealsByDateAndType(
  left: Pick<Meal, 'date' | 'type'>,
  right: Pick<Meal, 'date' | 'type'>,
) {
  const byDate = left.date.getTime() - right.date.getTime();

  if (byDate !== 0) {
    return byDate;
  }

  const leftOrder = isMealType(left.type) ? mealTypeOrder[left.type] : Number.MAX_SAFE_INTEGER;
  const rightOrder = isMealType(right.type) ? mealTypeOrder[right.type] : Number.MAX_SAFE_INTEGER;

  return leftOrder - rightOrder;
}

export function serializeOwnerMeal(meal: OwnerMealRecord, totalPossible: number) {
  return {
    id: meal.id,
    date: formatDateInput(meal.date),
    type: meal.type,
    menu: parseMealMenu(meal.menu),
    timing: meal.timing,
    attendingCount: meal._count.participations,
    totalPossible,
  };
}

export function serializeStudentMeal(meal: StudentMealRecord) {
  return {
    id: meal.id,
    date: formatDateInput(meal.date),
    type: meal.type,
    menu: parseMealMenu(meal.menu),
    timing: meal.timing,
    rsvp: meal.participations[0]?.willAttend ?? null,
  };
}
