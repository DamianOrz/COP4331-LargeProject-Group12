// Mock service now. Replace these internals with Express fetch calls later while keeping the exported function names and response shapes.
export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

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

const demoUserId = 'user-1';
const delay = () => new Promise((resolve) => window.setTimeout(resolve, 250));

let mockRecipes: Recipe[] = [
  {
    _id: 'recipe-1',
    userId: demoUserId,
    recipeName: 'Chicken Rice Bowl',
    description: 'Grilled chicken with brown rice, broccoli, and tomatoes.',
    ingredients: [
      { name: 'chicken breast', quantity: 1, unit: 'lb' },
      { name: 'brown rice', quantity: 1, unit: 'cup' },
      { name: 'broccoli', quantity: 2, unit: 'cups' }
    ],
    instructions: ['Cook the rice.', 'Grill the chicken.', 'Steam broccoli and assemble the bowl.'],
    mealType: 'dinner',
    prepTime: 35,
    servings: 3,
    createdAt: '2026-07-01T12:00:00.000Z'
  },
  {
    _id: 'recipe-2',
    userId: demoUserId,
    recipeName: 'Greek Yogurt Parfait',
    description: 'Greek yogurt layered with berries and granola.',
    ingredients: [
      { name: 'greek yogurt', quantity: 1, unit: 'cup' },
      { name: 'berries', quantity: 0.5, unit: 'cup' },
      { name: 'granola', quantity: 0.25, unit: 'cup' }
    ],
    instructions: ['Add yogurt to a bowl.', 'Top with berries and granola.'],
    mealType: 'breakfast',
    prepTime: 5,
    servings: 1,
    createdAt: '2026-07-02T12:00:00.000Z'
  },
  {
    _id: 'recipe-3',
    userId: demoUserId,
    recipeName: 'Turkey Wrap',
    description: 'Simple lunch wrap with turkey, spinach, and hummus.',
    ingredients: [
      { name: 'whole wheat tortilla', quantity: 1, unit: 'piece' },
      { name: 'turkey slices', quantity: 4, unit: 'oz' },
      { name: 'spinach', quantity: 1, unit: 'cup' }
    ],
    instructions: ['Spread hummus on the tortilla.', 'Add turkey and spinach.', 'Roll tightly and slice.'],
    mealType: 'lunch',
    prepTime: 10,
    servings: 1,
    createdAt: '2026-07-03T12:00:00.000Z'
  }
];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export async function listRecipes(filters: RecipeFilters = {}): Promise<Recipe[]> {
  await delay();
  const search = filters.search?.trim().toLowerCase() ?? '';
  return clone(
    mockRecipes.filter((recipe) => {
      const matchesSearch = !search || recipe.recipeName.toLowerCase().includes(search) || recipe.description.toLowerCase().includes(search);
      const matchesMealType = !filters.mealType || filters.mealType === 'all' || recipe.mealType === filters.mealType;
      return matchesSearch && matchesMealType;
    })
  );
}

export async function getRecipe(recipeId: string): Promise<Recipe | undefined> {
  await delay();
  const recipe = mockRecipes.find((item) => {
    const legacyId = (item as Recipe & { id?: string }).id;
    return String(item._id) === String(recipeId) || (legacyId !== undefined && String(legacyId) === String(recipeId));
  });
  return recipe ? clone(recipe) : undefined;
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  await delay();
  const recipe: Recipe = {
    ...input,
    _id: `recipe-${Date.now()}`,
    userId: demoUserId,
    createdAt: new Date().toISOString()
  };
  mockRecipes = [recipe, ...mockRecipes];
  return clone(recipe);
}

export async function updateRecipe(recipeId: string, input: RecipeInput): Promise<Recipe> {
  await delay();
  const existing = mockRecipes.find((recipe) => recipe._id === recipeId);
  if (!existing) {
    throw new Error('Recipe not found.');
  }
  const updated = { ...existing, ...input };
  mockRecipes = mockRecipes.map((recipe) => (recipe._id === recipeId ? updated : recipe));
  return clone(updated);
}

export async function deleteRecipe(recipeId: string): Promise<void> {
  await delay();
  mockRecipes = mockRecipes.filter((recipe) => recipe._id !== recipeId);
}
