import { getSessionState } from '../authSession';
import type { MealType } from './recipeApi';
import { ApiError, postApi } from './apiClient';

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

interface MealPlanResponse {
  mealPlan: MealPlan | null;
}

export const weekdays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

let currentMealPlan: MealPlan | null = null;

function getUserId(): string {
  const userId = getSessionState().user?._id;
  if (!userId) throw new ApiError('Please log in to continue.', 401);
  return userId;
}

function getCurrentWeekStart(): string {
  const date = new Date();
  const day = date.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - daysSinceMonday);
  return date.toISOString().slice(0, 10);
}

async function saveMealPlan(plan: MealPlan): Promise<MealPlan> {
  const response = await postApi<MealPlanResponse>('mealplans/save', {
    userId: getUserId(),
    weekStartDate: plan.weekStartDate,
    plannedMeals: plan.plannedMeals
  });
  if (!response.mealPlan) throw new ApiError('Weekly meal plan was not saved.', 500);
  currentMealPlan = response.mealPlan;
  return response.mealPlan;
}

export async function getWeeklyMealPlan(weekStartDate = getCurrentWeekStart()): Promise<MealPlan> {
  const response = await postApi<MealPlanResponse>('mealplans/get', {
    userId: getUserId(),
    weekStartDate
  });
  if (!response.mealPlan) throw new ApiError('Weekly meal plan was not loaded.', 500);
  currentMealPlan = response.mealPlan;
  return response.mealPlan;
}

export async function assignMeal(input: PlannedMeal): Promise<MealPlan> {
  const plan = currentMealPlan ?? await getWeeklyMealPlan();
  const existingIndex = plan.plannedMeals.findIndex(
    (meal) => meal.dayOfWeek === input.dayOfWeek && meal.mealType === input.mealType
  );
  const plannedMeals = [...plan.plannedMeals];

  if (existingIndex >= 0) plannedMeals[existingIndex] = input;
  else plannedMeals.push(input);

  return saveMealPlan({ ...plan, plannedMeals });
}

export async function updatePlannedMeal(index: number, input: PlannedMeal): Promise<MealPlan> {
  const plan = currentMealPlan ?? await getWeeklyMealPlan();
  const plannedMeals = [...plan.plannedMeals];
  plannedMeals[index] = input;
  return saveMealPlan({ ...plan, plannedMeals });
}

export async function deletePlannedMeal(index: number): Promise<MealPlan> {
  const plan = currentMealPlan ?? await getWeeklyMealPlan();
  const plannedMeals = plan.plannedMeals.filter((_, mealIndex) => mealIndex !== index);
  return saveMealPlan({ ...plan, plannedMeals });
}
