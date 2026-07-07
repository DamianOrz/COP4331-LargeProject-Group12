import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRecipe, type Recipe } from '../../api/recipeApi';
import AppShell from './AppShell';

interface RouteParams {
  id: string;
}

function RecipeDetailsPage() {
  const { id } = useParams<RouteParams>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getRecipe(id).then((data) => {
      if (!isMounted) return;
      setRecipe(data ?? null);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <AppShell title="Recipe Details"><div className="planner-panel">Loading recipe...</div></AppShell>;
  }

  if (!recipe) {
    return <AppShell title="Recipe Details"><div className="planner-panel empty-state">Recipe not found.</div></AppShell>;
  }

  return (
    <AppShell
      title={recipe.recipeName}
      subtitle={recipe.description}
      action={<Link className="planner-button" to={`/recipes/${recipe._id}/edit`}>Edit Recipe</Link>}
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
              <li key={`${ingredient.name}-${ingredient.unit}`}>{ingredient.quantity} {ingredient.unit} {ingredient.name}</li>
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
          <Link className="secondary-link" to="/planner">Assign to weekly planner</Link>
        </div>
      </section>
    </AppShell>
  );
}

export default RecipeDetailsPage;
