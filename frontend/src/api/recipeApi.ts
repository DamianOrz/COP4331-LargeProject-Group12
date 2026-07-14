import { getSessionState } from '../authSession';
import { ApiError, postApi } from './apiClient';

export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type Ingredient = string;

export interface Recipe {
  _id: string;
  userId: string;
  recipeName: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  mealType: MealType;
  prepTime: number;
  servings: number;
  createdAt: string;
}

export interface RecipeInput {
  recipeName: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  mealType: MealType;
  prepTime: number;
  servings: number;
}

export interface RecipeFilters {
  search?: string;
  mealType?: MealType | 'all';
}

interface RecipeListResponse {
  recipes: Recipe[];
}

interface RecipeResponse {
  recipe: Recipe | null;
}

function getUserId(): string {
  const userId = getSessionState().user?._id;
  if (!userId) throw new ApiError('Please log in to continue.', 401);
  return userId;
}

export async function listRecipes(filters: RecipeFilters = {}): Promise<Recipe[]> {
  const response = await postApi<RecipeListResponse>('recipes/list', {
    userId: getUserId(),
    search: filters.search ?? '',
    mealType: filters.mealType ?? 'all'
  });
  return response.recipes;
}

export async function getRecipe(recipeId: string): Promise<Recipe | undefined> {
  try {
    const response = await postApi<RecipeResponse>('recipes/get', { recipeId });
    return response.recipe ?? undefined;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  const response = await postApi<RecipeResponse>('recipes/create', {
    ...input,
    userId: getUserId()
  });
  if (!response.recipe) throw new ApiError('Recipe was not created.', 500);
  return response.recipe;
}

export async function updateRecipe(recipeId: string, input: RecipeInput): Promise<Recipe> {
  const response = await postApi<RecipeResponse>('recipes/update', { recipeId, ...input });
  if (!response.recipe) throw new ApiError('Recipe not found.', 404);
  return response.recipe;
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  await postApi<Record<string, never>>('recipes/delete', { recipeId });
}
