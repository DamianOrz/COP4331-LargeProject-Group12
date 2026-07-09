import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { createRecipe, getRecipe, updateRecipe, type Ingredient, type MealType, type RecipeInput } from '../../api/recipeApi';
import AppShell from './AppShell';

interface RouteParams {
  recipeId?: string;
}

const emptyIngredient: Ingredient = { name: '', quantity: 1, unit: '' };
const validMealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];

function RecipeFormPage() {
  const { recipeId } = useParams<RouteParams>();
  const history = useHistory();
  const isEditing = Boolean(recipeId);
  const [form, setForm] = useState<RecipeInput>({
    recipeName: '',
    description: '',
    ingredients: [{ ...emptyIngredient }],
    instructions: [''],
    mealType: 'dinner',
    prepTime: 30,
    servings: 2
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(recipeId));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!recipeId) return;
    let isMounted = true;
    setIsLoading(true);
    setLoadError('');

    getRecipe(recipeId)
      .then((recipe) => {
        if (!isMounted) return;
        if (!recipe) {
          setLoadError('Recipe not found.');
          return;
        }

        setForm({
          recipeName: recipe.recipeName,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          mealType: recipe.mealType,
          prepTime: recipe.prepTime,
          servings: recipe.servings
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setLoadError('Failed to load recipe.');
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [recipeId]);

  const updateField = (field: keyof RecipeInput, value: string | number | MealType | Ingredient[] | string[]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const nextIngredients = form.ingredients.map((ingredient, ingredientIndex) =>
      ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient
    );
    updateField('ingredients', nextIngredients);
    setErrors((current) => ({ ...current, [`ingredient-${index}-${field}`]: '', ingredients: '' }));
  };

  const addIngredient = () => updateField('ingredients', [...form.ingredients, { ...emptyIngredient }]);

  const removeIngredient = (index: number) => {
    const nextIngredients = form.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index);
    updateField('ingredients', nextIngredients.length > 0 ? nextIngredients : [{ ...emptyIngredient }]);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.recipeName.trim()) nextErrors.recipeName = 'Recipe name is required.';
    if (!form.description.trim()) nextErrors.description = 'Description is required.';
    if (!validMealTypes.includes(form.mealType)) nextErrors.mealType = 'Choose a valid meal type.';
    if (!form.ingredients.some((ingredient) => ingredient.name.trim())) nextErrors.ingredients = 'At least one ingredient is required.';

    form.ingredients.forEach((ingredient, index) => {
      if (!ingredient.name.trim()) nextErrors[`ingredient-${index}-name`] = 'Ingredient name is required.';
      if (!Number.isFinite(ingredient.quantity) || ingredient.quantity <= 0) {
        nextErrors[`ingredient-${index}-quantity`] = 'Quantity must be positive.';
      }
    });

    if (!form.instructions.some((instruction) => instruction.trim())) nextErrors.instructions = 'At least one instruction is required.';
    if (!Number.isFinite(form.prepTime) || form.prepTime <= 0) nextErrors.prepTime = 'Prep time must be greater than zero.';
    if (!Number.isFinite(form.servings) || form.servings <= 0) nextErrors.servings = 'Servings must be greater than zero.';
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setMessage('Please fix the highlighted fields.');
      return;
    }

    setIsSaving(true);
    setMessage(isEditing ? 'Saving recipe...' : 'Creating recipe...');
    const payload: RecipeInput = {
      ...form,
      ingredients: form.ingredients.filter((ingredient) => ingredient.name.trim()),
      instructions: form.instructions.map((instruction) => instruction.trim()).filter(Boolean)
    };

    if (isEditing && recipeId) {
      await updateRecipe(recipeId, payload);
    } else {
      await createRecipe(payload);
    }

    setIsSaving(false);
    history.push('/app/recipes');
  };

  if (isLoading) {
    return <AppShell title={isEditing ? 'Edit Recipe' : 'Add Recipe'}><div className="planner-panel">Loading recipe...</div></AppShell>;
  }

  if (loadError) {
    return <AppShell title={isEditing ? 'Edit Recipe' : 'Add Recipe'}><div className="planner-panel empty-state" role="alert">{loadError}</div></AppShell>;
  }

  return (
    <AppShell title={isEditing ? 'Edit Recipe' : 'Add Recipe'} subtitle="Save recipe details for future meal planning.">
      <form className="planner-panel recipe-form" onSubmit={handleSubmit} noValidate>
        {message && <div className={Object.keys(errors).length > 0 ? 'planner-message error' : 'planner-message'} role="status">{message}</div>}

        <label>
          <span>Recipe Name</span>
          <input value={form.recipeName} onChange={(event) => updateField('recipeName', event.target.value)} aria-invalid={Boolean(errors.recipeName)} />
          {errors.recipeName && <small>{errors.recipeName}</small>}
        </label>

        <label>
          <span>Description</span>
          <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} aria-invalid={Boolean(errors.description)} />
          {errors.description && <small>{errors.description}</small>}
        </label>

        <div className="form-grid-three">
          <label>
            <span>Meal Type</span>
            <select value={form.mealType} onChange={(event) => updateField('mealType', event.target.value as MealType)} aria-invalid={Boolean(errors.mealType)}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
            {errors.mealType && <small>{errors.mealType}</small>}
          </label>
          <label>
            <span>Prep Time</span>
            <input type="number" min="1" value={form.prepTime} onChange={(event) => updateField('prepTime', Number(event.target.value))} aria-invalid={Boolean(errors.prepTime)} />
            {errors.prepTime && <small>{errors.prepTime}</small>}
          </label>
          <label>
            <span>Servings</span>
            <input type="number" min="1" value={form.servings} onChange={(event) => updateField('servings', Number(event.target.value))} aria-invalid={Boolean(errors.servings)} />
            {errors.servings && <small>{errors.servings}</small>}
          </label>
        </div>

        <fieldset>
          <legend>Ingredients</legend>
          {form.ingredients.map((ingredient, index) => (
            <div className="ingredient-row" key={`ingredient-${index}`}>
              <label>
                <span>Ingredient Name</span>
                <input value={ingredient.name} onChange={(event) => updateIngredient(index, 'name', event.target.value)} aria-invalid={Boolean(errors[`ingredient-${index}-name`])} />
                {errors[`ingredient-${index}-name`] && <small>{errors[`ingredient-${index}-name`]}</small>}
              </label>
              <label>
                <span>Quantity</span>
                <input type="number" min="0.01" step="0.25" value={ingredient.quantity} onChange={(event) => updateIngredient(index, 'quantity', Number(event.target.value))} aria-invalid={Boolean(errors[`ingredient-${index}-quantity`])} />
                {errors[`ingredient-${index}-quantity`] && <small>{errors[`ingredient-${index}-quantity`]}</small>}
              </label>
              <label>
                <span>Unit</span>
                <input value={ingredient.unit} onChange={(event) => updateIngredient(index, 'unit', event.target.value)} />
              </label>
              <button type="button" className="secondary-button" onClick={() => removeIngredient(index)}>Remove</button>
            </div>
          ))}
          {errors.ingredients && <small>{errors.ingredients}</small>}
          <button type="button" className="secondary-button" onClick={addIngredient}>Add Ingredient</button>
        </fieldset>

        <label>
          <span>Instructions</span>
          <textarea value={form.instructions.join('\n')} onChange={(event) => updateField('instructions', event.target.value.split('\n'))} aria-invalid={Boolean(errors.instructions)} />
          {errors.instructions && <small>{errors.instructions}</small>}
        </label>

        <div className="form-actions">
          <button className="planner-button" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Recipe'}</button>
          <Link className="secondary-link" to="/app/recipes">Cancel</Link>
        </div>
      </form>
    </AppShell>
  );
}

export default RecipeFormPage;
