import type { MealType } from './recipeApi';

// Mock service now. Replace these internals with Express fetch calls later while keeping the exported function names and response shapes.
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface PlannedMeal {
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipeId: string;
  plannedDate?: string;
  notes: string;
}

export interface MealPlan {
  _id: string;
  userId: string;
  weekStartDate: string;
  plannedMeals: PlannedMeal[];
  createdAt: string;
}

export const weekdays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const delay = () => new Promise((resolve) => window.setTimeout(resolve, 250));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

let mockMealPlan: MealPlan = {
  _id: 'meal-plan-1',
  userId: 'user-1',
  weekStartDate: '2026-07-06',
  plannedMeals: [
    { dayOfWeek: 'Monday', mealType: 'dinner', recipeId: 'recipe-1', plannedDate: '2026-07-06', notes: 'Make extra rice.' },
    { dayOfWeek: 'Tuesday', mealType: 'breakfast', recipeId: 'recipe-2', plannedDate: '2026-07-07', notes: '' },
    { dayOfWeek: 'Wednesday', mealType: 'lunch', recipeId: 'recipe-3', plannedDate: '2026-07-08', notes: 'Pack before class.' }
  ],
  createdAt: '2026-07-01T12:00:00.000Z'
};

export async function getWeeklyMealPlan(): Promise<MealPlan> {
  await delay();
  return clone(mockMealPlan);
}

export async function assignMeal(input: PlannedMeal): Promise<MealPlan> {
  await delay();
  const existingIndex = mockMealPlan.plannedMeals.findIndex(
    (meal) => meal.dayOfWeek === input.dayOfWeek && meal.mealType === input.mealType
  );

  if (existingIndex >= 0) {
    mockMealPlan.plannedMeals[existingIndex] = input;
  } else {
    mockMealPlan.plannedMeals = [...mockMealPlan.plannedMeals, input];
  }

  return clone(mockMealPlan);
}

export async function updatePlannedMeal(index: number, input: PlannedMeal): Promise<MealPlan> {
  await delay();
  mockMealPlan.plannedMeals[index] = input;
  return clone(mockMealPlan);
}

export async function deletePlannedMeal(index: number): Promise<MealPlan> {
  await delay();
  mockMealPlan.plannedMeals = mockMealPlan.plannedMeals.filter((_, mealIndex) => mealIndex !== index);
  return clone(mockMealPlan);
}
