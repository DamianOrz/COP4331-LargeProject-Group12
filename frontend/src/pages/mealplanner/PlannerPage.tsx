import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { assignMeal, deletePlannedMeal, getWeeklyMealPlan, weekdays, type DayOfWeek, type MealPlan } from '../../api/mealPlanApi';
import { listRecipes, type MealType, type Recipe } from '../../api/recipeApi';
import AppShell from './AppShell';

interface PlannerForm {
  dayOfWeek: DayOfWeek;
  mealType: MealType;
  recipeId: string;
  notes: string;
}

function PlannerPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [form, setForm] = useState<PlannerForm>({ dayOfWeek: 'Monday', mealType: 'dinner', recipeId: '', notes: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([listRecipes(), getWeeklyMealPlan()]).then(([recipeData, planData]) => {
      if (!isMounted) return;
      setRecipes(recipeData);
      setMealPlan(planData);
      setForm((current) => ({ ...current, recipeId: recipeData[0]?._id ?? '' }));
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const recipeById = useMemo(() => new Map(recipes.map((recipe) => [recipe._id, recipe])), [recipes]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.recipeId) {
      setError('Choose a recipe before assigning a meal.');
      return;
    }

    setError('');
    setMessage('Assigning meal...');
    setIsSaving(true);
    const updatedPlan = await assignMeal(form);
    setMealPlan(updatedPlan);
    setMessage('Meal assigned to weekly planner.');
    setIsSaving(false);
  };

  const handleDelete = async (index: number) => {
    setMessage('Removing meal...');
    const updatedPlan = await deletePlannedMeal(index);
    setMealPlan(updatedPlan);
    setMessage('Meal removed from planner.');
  };

  return (
    <AppShell title="Weekly Meal Planner" subtitle="Assign recipes to Monday through Sunday.">
      {isLoading ? (
        <div className="planner-panel">Loading weekly planner...</div>
      ) : (
        <section className="planner-grid-two planner-grid-wide">
          <form className="planner-panel planner-assignment-form" onSubmit={handleSubmit} noValidate>
            <div className="panel-heading">
              <h2>Assign Recipe</h2>
            </div>
            {message && <div className="planner-message" role="status">{message}</div>}
            {error && <div className="planner-message error" role="alert">{error}</div>}

            <label>
              <span>Day of Week</span>
              <select value={form.dayOfWeek} onChange={(event) => setForm({ ...form, dayOfWeek: event.target.value as DayOfWeek })}>
                {weekdays.map((day) => <option key={day} value={day}>{day}</option>)}
              </select>
            </label>

            <label>
              <span>Meal Type</span>
              <select value={form.mealType} onChange={(event) => setForm({ ...form, mealType: event.target.value as MealType })}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </label>

            <label>
              <span>Recipe</span>
              <select value={form.recipeId} onChange={(event) => setForm({ ...form, recipeId: event.target.value })}>
                {recipes.map((recipe) => <option key={recipe._id} value={recipe._id}>{recipe.recipeName}</option>)}
              </select>
            </label>

            <label>
              <span>Notes</span>
              <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Optional notes" />
            </label>

            <button className="planner-button" type="submit" disabled={isSaving}>{isSaving ? 'Assigning...' : 'Assign to Week'}</button>
          </form>

          <div className="planner-panel">
            <div className="panel-heading">
              <h2>Monday-Sunday Plan</h2>
            </div>
            <div className="week-list">
              {weekdays.map((day) => {
                const meals = mealPlan?.plannedMeals
                  .map((meal, index) => ({ meal, index }))
                  .filter(({ meal }) => meal.dayOfWeek === day) ?? [];

                return (
                  <section className="planner-day" key={day}>
                    <h3>{day}</h3>
                    {meals.length === 0 ? (
                      <p>No meals planned.</p>
                    ) : (
                      meals.map(({ meal, index }) => {
                        const recipe = recipeById.get(meal.recipeId);
                        return (
                          <div className="planned-meal" key={`${meal.dayOfWeek}-${meal.mealType}-${meal.recipeId}`}>
                            <div>
                              <span className="meal-pill">{meal.mealType}</span>
                              <strong>{recipe?.recipeName ?? 'Recipe'}</strong>
                              {meal.notes && <p>{meal.notes}</p>}
                            </div>
                            <button type="button" className="text-button" onClick={() => handleDelete(index)}>Remove</button>
                          </div>
                        );
                      })
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </AppShell>
  );
}

export default PlannerPage;

