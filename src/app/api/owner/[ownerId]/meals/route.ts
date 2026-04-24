export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { publishMealEvent } from '@/lib/meal-events';
import {
  compareMealsByDateAndType,
  getUtcDayRange,
  isMealType,
  normalizeMenuItems,
  parseDateInput,
  serializeOwnerMeal,
} from '@/lib/meal-utils';

interface RouteContext {
  params: Promise<{ ownerId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { ownerId } = await context.params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner ID is required.' }, { status: 400 });
    }

    const where: Prisma.MealWhereInput = { ownerId };
    if (date) {
      const dayRange = getUtcDayRange(date);

      if (!dayRange) {
        return NextResponse.json({ error: 'A valid date is required.' }, { status: 400 });
      }

      where.date = {
        gte: dayRange.start,
        lte: dayRange.end,
      };
    }

    const [meals, students] = await Promise.all([
      db.meal.findMany({
        where,
        include: {
          _count: {
            select: {
              participations: {
                where: { willAttend: true },
              },
            },
          },
        },
      }),
      db.student.findMany({
        where: { ownerId },
        select: { id: true },
      }),
    ]);

    const totalPossible = students.length;
    const studentIds = students.map((student) => student.id);
    const serializedMeals = meals
      .sort(compareMealsByDateAndType)
      .map((meal) => serializeOwnerMeal(meal, totalPossible));

    return NextResponse.json({
      meals: serializedMeals,
      totalPossible,
      studentIds,
    });
  } catch (error) {
    console.error('Owner Meals API Error:', error);
    return NextResponse.json({ error: 'Unable to fetch meals.' }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { ownerId } = await context.params;
    const body = await request.json();
    const date = typeof body?.date === 'string' ? body.date : '';
    const type = typeof body?.type === 'string' ? body.type : '';
    const timing = typeof body?.timing === 'string' ? body.timing.trim() : '';
    const menu = normalizeMenuItems(body?.menu);
    const parsedDate = parseDateInput(date);

    if (!ownerId || !parsedDate || !isMealType(type) || !timing || menu.length === 0) {
      return NextResponse.json({ error: 'Date, meal type, timing, and menu are required.' }, { status: 400 });
    }

    const meal = await db.meal.create({
      data: {
        ownerId,
        date: parsedDate,
        type,
        timing,
        menu: JSON.stringify(menu),
      },
      include: {
        _count: {
          select: {
            participations: {
              where: { willAttend: true },
            },
          },
        },
      },
    });

    const totalPossible = await db.student.count({ where: { ownerId } });
    publishMealEvent({ ownerId, action: 'created', mealId: meal.id });

    return NextResponse.json(
      {
        meal: serializeOwnerMeal(meal, totalPossible),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'A meal already exists for this date and type.' }, { status: 409 });
    }

    console.error('Owner Meal Create Error:', error);
    return NextResponse.json({ error: 'Unable to create meal.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { ownerId } = await context.params;
    const body = await request.json();
    const mealId = typeof body?.mealId === 'string' ? body.mealId : '';
    const date = typeof body?.date === 'string' ? body.date : '';
    const type = typeof body?.type === 'string' ? body.type : '';
    const timing = typeof body?.timing === 'string' ? body.timing.trim() : '';
    const menu = normalizeMenuItems(body?.menu);
    const parsedDate = parseDateInput(date);

    if (!mealId || !ownerId || !parsedDate || !isMealType(type) || !timing || menu.length === 0) {
      return NextResponse.json({ error: 'Meal ID, date, meal type, timing, and menu are required.' }, { status: 400 });
    }

    const existingMeal = await db.meal.findFirst({
      where: {
        id: mealId,
        ownerId,
      },
    });

    if (!existingMeal) {
      return NextResponse.json({ error: 'Meal not found.' }, { status: 404 });
    }

    const meal = await db.meal.update({
      where: { id: mealId },
      data: {
        date: parsedDate,
        type,
        timing,
        menu: JSON.stringify(menu),
      },
      include: {
        _count: {
          select: {
            participations: {
              where: { willAttend: true },
            },
          },
        },
      },
    });

    const totalPossible = await db.student.count({ where: { ownerId } });
    publishMealEvent({ ownerId, action: 'updated', mealId: meal.id });

    return NextResponse.json({
      meal: serializeOwnerMeal(meal, totalPossible),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'A meal already exists for this date and type.' }, { status: 409 });
    }

    console.error('Owner Meal Update Error:', error);
    return NextResponse.json({ error: 'Unable to update meal.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { ownerId } = await context.params;
    const body = await request.json().catch(() => null);
    const mealId = typeof body?.mealId === 'string' ? body.mealId : '';

    if (!mealId || !ownerId) {
      return NextResponse.json({ error: 'Meal ID is required.' }, { status: 400 });
    }

    const existingMeal = await db.meal.findFirst({
      where: {
        id: mealId,
        ownerId,
      },
    });

    if (!existingMeal) {
      return NextResponse.json({ error: 'Meal not found.' }, { status: 404 });
    }

    await db.$transaction([
      db.mealParticipation.deleteMany({ where: { mealId } }),
      db.meal.delete({ where: { id: mealId } }),
    ]);

    publishMealEvent({ ownerId, action: 'deleted', mealId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Owner Meal Delete Error:', error);
    return NextResponse.json({ error: 'Unable to delete meal.' }, { status: 500 });
  }
}
