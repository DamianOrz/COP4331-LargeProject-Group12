import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getWeeklyMealPlan, weekdays, type MealPlan } from '../../api/mealPlanApi';
import { listRecipes, type Recipe } from '../../api/recipeApi';
import AppShell from './AppShell';

function DashboardPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([listRecipes(), getWeeklyMealPlan()]).then(([recipeData, planData]) => {
      if (!isMounted) return;
      setRecipes(recipeData);
      setMealPlan(planData);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const plannedCount = mealPlan?.plannedMeals.length ?? 0;
  const nextPlannedMeal = mealPlan?.plannedMeals[0];
  const nextRecipe = recipes.find((recipe) => recipe._id === nextPlannedMeal?.recipeId);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Plan recipes and assign meals for the week."
      action={<Link className="planner-button" to="/recipes/new">Add Recipe</Link>}
    >
      {isLoading ? (
        <div className="planner-panel">Loading dashboard...</div>
      ) : (
        <>
          <section className="summary-grid" aria-label="Meal planner summary">
            <div className="summary-card">
              <span>Recipes</span>
              <strong>{recipes.length}</strong>
            </div>
            <div className="summary-card">
              <span>Meals Planned</span>
              <strong>{plannedCount}</strong>
            </div>
            <div className="summary-card">
              <span>Next Meal</span>
              <strong>{nextRecipe ? nextRecipe.recipeName : 'None'}</strong>
            </div>
          </section>

          <section className="planner-grid-two">
            <div className="planner-panel">
              <div className="panel-heading">
                <h2>Quick Actions</h2>
              </div>
              <div className="action-list">
                <Link to="/recipes">View Recipes</Link>
                <Link to="/recipes/new">Create Recipe</Link>
                <Link to="/planner">Open Weekly Planner</Link>
              </div>
            </div>

            <div className="planner-panel">
              <div className="panel-heading">
                <h2>This Week</h2>
                <Link to="/planner">Edit</Link>
              </div>
              <div className="week-list compact-week-list">
                {weekdays.map((day) => {
                  const meals = mealPlan?.plannedMeals.filter((meal) => meal.dayOfWeek === day) ?? [];
                  return (
                    <div className="week-row" key={day}>
                      <strong>{day}</strong>
                      <span>
                        {meals.length > 0
                          ? meals.map((meal) => recipes.find((recipe) => recipe._id === meal.recipeId)?.recipeName ?? 'Recipe').join(', ')
                          : 'No meals planned'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

export default DashboardPage;
