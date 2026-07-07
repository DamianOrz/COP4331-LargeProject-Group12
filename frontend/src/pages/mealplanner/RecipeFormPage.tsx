import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { createRecipe, getRecipe, updateRecipe, type Ingredient, type MealType, type RecipeInput } from '../../api/recipeApi';
import AppShell from './AppShell';

interface RouteParams {
  id?: string;
}

const emptyIngredient: Ingredient = { name: '', quantity: 1, unit: '' };

function RecipeFormPage() {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const isEditing = Boolean(id);
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
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    getRecipe(id).then((recipe) => {
      if (!isMounted) return;
      if (recipe) {
        setForm({
          recipeName: recipe.recipeName,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          mealType: recipe.mealType,
          prepTime: recipe.prepTime,
          servings: recipe.servings
        });
      }
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const updateField = (field: keyof RecipeInput, value: string | number | MealType | Ingredient[] | string[]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const nextIngredients = form.ingredients.map((ingredient, ingredientIndex) =>
      ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient
    );
    updateField('ingredients', nextIngredients);
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
    if (!form.ingredients.some((ingredient) => ingredient.name.trim())) nextErrors.ingredients = 'At least one ingredient is required.';
    if (!form.instructions.some((instruction) => instruction.trim())) nextErrors.instructions = 'At least one instruction is required.';
    if (form.prepTime <= 0) nextErrors.prepTime = 'Prep time must be greater than zero.';
    if (form.servings <= 0) nextErrors.servings = 'Servings must be greater than zero.';
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

    if (isEditing && id) {
      await updateRecipe(id, payload);
    } else {
      await createRecipe(payload);
    }

    setIsSaving(false);
    history.push('/recipes');
  };

  if (isLoading) {
    return <AppShell title={isEditing ? 'Edit Recipe' : 'Add Recipe'}><div className="planner-panel">Loading recipe...</div></AppShell>;
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
            <select value={form.mealType} onChange={(event) => updateField('mealType', event.target.value as MealType)}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
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
                <span className="sr-only">Ingredient name</span>
                <input placeholder="Ingredient" value={ingredient.name} onChange={(event) => updateIngredient(index, 'name', event.target.value)} />
              </label>
              <label>
                <span className="sr-only">Quantity</span>
                <input type="number" min="0" step="0.25" placeholder="Qty" value={ingredient.quantity} onChange={(event) => updateIngredient(index, 'quantity', Number(event.target.value))} />
              </label>
              <label>
                <span className="sr-only">Unit</span>
                <input placeholder="Unit" value={ingredient.unit} onChange={(event) => updateIngredient(index, 'unit', event.target.value)} />
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
          <Link className="secondary-link" to="/recipes">Cancel</Link>
        </div>
      </form>
    </AppShell>
  );
}

export default RecipeFormPage;

