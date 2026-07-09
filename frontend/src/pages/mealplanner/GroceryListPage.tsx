import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWeeklyMealPlan, type MealPlan } from '../../api/mealPlanApi';
import { listRecipes, type Ingredient, type Recipe } from '../../api/recipeApi';
import AppShell from './AppShell';

interface GroceryItem extends Ingredient {
  recipeNames: string[];
}

const normalizeText = (value: string) => value.trim().toLowerCase();

function GroceryListPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');

    Promise.all([listRecipes(), getWeeklyMealPlan()])
      .then(([recipeData, planData]) => {
        if (!isMounted) return;
        setRecipes(recipeData);
        setMealPlan(planData);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Failed to load grocery list.');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const plannedRecipes = useMemo(() => {
    const plannedRecipeIds = new Set(mealPlan?.plannedMeals.map((meal) => meal.recipeId) ?? []);
    return recipes.filter((recipe) => plannedRecipeIds.has(recipe._id));
  }, [mealPlan, recipes]);

  const groceryItems = useMemo(() => {
    const itemMap = new Map<string, GroceryItem>();

    plannedRecipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        const ingredientName = ingredient.name.trim();
        const ingredientUnit = ingredient.unit.trim();
        if (!ingredientName) return;

        const itemKey = `${normalizeText(ingredientName)}-${normalizeText(ingredientUnit)}`;
        const existingItem = itemMap.get(itemKey);

        if (existingItem) {
          existingItem.quantity += ingredient.quantity;
          if (!existingItem.recipeNames.includes(recipe.recipeName)) {
            existingItem.recipeNames.push(recipe.recipeName);
          }
        } else {
          itemMap.set(itemKey, {
            name: ingredientName,
            quantity: ingredient.quantity,
            unit: ingredientUnit,
            recipeNames: [recipe.recipeName]
          });
        }
      });
    });

    return Array.from(itemMap.values()).sort((firstItem, secondItem) => firstItem.name.localeCompare(secondItem.name));
  }, [plannedRecipes]);

  const plannedMealCount = mealPlan?.plannedMeals.length ?? 0;

  return (
    <AppShell
      title="Grocery List"
      subtitle="Combine ingredients from the meals currently assigned to the weekly planner."
      action={<Link className="planner-button" to="/app/planner">Edit Weekly Plan</Link>}
    >
      {isLoading ? (
        <div className="planner-panel">Loading grocery list...</div>
      ) : error ? (
        <div className="planner-panel empty-state" role="alert">{error}</div>
      ) : plannedMealCount === 0 ? (
        <section className="planner-panel empty-state" aria-label="Empty grocery list">
          <h2>No meals planned yet.</h2>
          <p>Add meals to the weekly planner first, then the grocery list will combine the recipe ingredients here.</p>
          <Link className="secondary-link" to="/app/planner">Open Weekly Planner</Link>
        </section>
      ) : (
        <>
          <section className="summary-grid" aria-label="Grocery list summary">
            <div className="summary-card">
              <span>Planned Meals</span>
              <strong>{plannedMealCount}</strong>
            </div>
            <div className="summary-card">
              <span>Recipes Used</span>
              <strong>{plannedRecipes.length}</strong>
            </div>
            <div className="summary-card">
              <span>Grocery Items</span>
              <strong>{groceryItems.length}</strong>
            </div>
          </section>

          <section className="planner-panel grocery-panel" aria-label="Combined grocery ingredients">
            <div className="panel-heading">
              <h2>Combined Ingredients</h2>
              <Link to="/app/recipes">View recipes</Link>
            </div>

            {groceryItems.length === 0 ? (
              <p className="empty-state">The planned recipes do not have ingredients yet.</p>
            ) : (
              <div className="grocery-list">
                {groceryItems.map((item) => (
                  <article className="grocery-item" key={`${item.name}-${item.unit}`}>
                    <label>
                      <input type="checkbox" aria-label={`Mark ${item.name} as purchased`} />
                      <span>{item.name}</span>
                    </label>
                    <strong>{Number(item.quantity.toFixed(2))} {item.unit}</strong>
                    <small>Used in {item.recipeNames.join(', ')}</small>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}

export default GroceryListPage;
