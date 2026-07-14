import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRecipe, type Recipe } from '../../api/recipeApi';
import AppShell from './AppShell';

interface RouteParams {
  recipeId: string;
}

function RecipeDetailsPage() {
  const { recipeId } = useParams<RouteParams>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');

    getRecipe(recipeId)
      .then((data) => {
        if (!isMounted) return;
        setRecipe(data ?? null);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Failed to load recipe.');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [recipeId]);

  if (isLoading) {
    return <AppShell title="Recipe Details"><div className="planner-panel">Loading recipe...</div></AppShell>;
  }

  if (error) {
    return <AppShell title="Recipe Details"><div className="planner-panel empty-state" role="alert">{error}</div></AppShell>;
  }

  if (!recipe) {
    return (
      <AppShell title="Recipe Details">
        <div className="planner-panel empty-state">
          <h2>Recipe not found.</h2>
          <p>This recipe may have been deleted or the link may be incorrect.</p>
          <Link className="secondary-link" to="/app/recipes">Back to recipes</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={recipe.recipeName}
      subtitle={recipe.description}
      action={<Link className="planner-button" to={`/app/recipes/${recipe._id}/edit`}>Edit Recipe</Link>}
    >
      <section className="planner-grid-two">
        <div className="planner-panel">
          <div className="recipe-meta detail-meta">
            <span>{recipe.mealType}</span>
            <span>{recipe.prepTime} min</span>
            <span>{recipe.servings} servings</span>
          </div>
          <h2>Ingredients</h2>
          <ul className="detail-list">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <div className="planner-panel">
          <h2>Instructions</h2>
          <ol className="detail-list">
            {recipe.instructions.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ol>
          <Link className="secondary-link" to="/app/planner">Assign to weekly planner</Link>
        </div>
      </section>
    </AppShell>
  );
}

export default RecipeDetailsPage;
