import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteRecipe, listRecipes, type MealType, type Recipe } from '../../api/recipeApi';
import AppShell from './AppShell';

function RecipeListPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState<MealType | 'all'>('all');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingRecipeId, setDeletingRecipeId] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');

    listRecipes({ search, mealType })
      .then((data) => {
        if (!isMounted) return;
        setRecipes(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Failed to load recipes.');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, mealType]);

  const handleDelete = async (recipeId: string) => {
    const confirmed = window.confirm('Delete this recipe?');
    if (!confirmed) return;
    setActionError('');
    setMessage('Deleting recipe...');
    setDeletingRecipeId(recipeId);

    try {
      await deleteRecipe(recipeId);
      setRecipes(await listRecipes({ search, mealType }));
      setMessage('Recipe deleted.');
    } catch {
      setMessage('');
      setActionError('Failed to delete recipe.');
    } finally {
      setDeletingRecipeId('');
    }
  };

  const hasFilters = Boolean(search.trim()) || mealType !== 'all';

  return (
    <AppShell
      title="Recipes"
      subtitle="Create, search, edit, and delete recipe ideas."
      action={<Link className="planner-button" to="/app/recipes/new">Add Recipe</Link>}
    >
      <section className="planner-panel">
        <div className="filter-row">
          <label>
            <span>Search recipes</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or description" />
          </label>
          <label>
            <span>Meal type</span>
            <select value={mealType} onChange={(event) => setMealType(event.target.value as MealType | 'all')}>
              <option value="all">All</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </label>
        </div>
        {message && <div className="planner-message" role="status">{message}</div>}
        {actionError && <div className="planner-message error" role="alert">{actionError}</div>}
      </section>

      {isLoading ? (
        <div className="planner-panel">Loading recipes...</div>
      ) : error ? (
        <div className="planner-panel empty-state" role="alert">{error}</div>
      ) : recipes.length === 0 ? (
        <div className="planner-panel empty-state">{hasFilters ? 'Search returned no recipes.' : 'No recipes yet.'}</div>
      ) : (
        <section className="recipe-list" aria-label="Recipe list">
          {recipes.map((recipe) => (
            <article className="recipe-card" key={recipe._id}>
              <div>
                <span className="meal-pill">{recipe.mealType}</span>
                <h2>{recipe.recipeName}</h2>
                <p>{recipe.description}</p>
                <div className="recipe-meta">
                  <span>{recipe.prepTime} min</span>
                  <span>{recipe.servings} servings</span>
                  <span>{recipe.ingredients.length} ingredients</span>
                </div>
              </div>
              <div className="card-actions">
                <Link to={`/app/recipes/${recipe._id}`}>Details</Link>
                <Link to={`/app/recipes/${recipe._id}/edit`}>Edit</Link>
                <button type="button" onClick={() => handleDelete(recipe._id)} disabled={deletingRecipeId === recipe._id}>
                  {deletingRecipeId === recipe._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </AppShell>
  );
}

export default RecipeListPage;
