# Frontend Routes and Validation Notes

## Routes

- `/login`: Login form with email and password validation.
- `/register`: Registration form with name, email, password, confirm password, and terms checkbox validation.
- `/check-email`: Post-register verification reminder screen.
- `/verify-email` and `/verify-email-success`: Email verification success state.
- `/verify-email-invalid`: Invalid or expired verification state.
- `/forgot-password`: Password reset link request form.
- `/reset-password`: New password and confirm password form.
- `/app`: Protected Meal Planner dashboard shell with recipe and weekly plan summary.
- `/app/recipes`: Protected API-backed recipe list with search, filter, edit, delete, and details links.
- `/app/recipes/new`: Protected create recipe form using the Express recipe API.
- `/app/recipes/:recipeId`: Protected recipe details page.
- `/app/recipes/:recipeId/edit`: Protected edit recipe form using the Express recipe API.
- `/app/planner`: Protected weekly planner grouped Monday through Sunday with recipe assignment.
- `/app/account`: Protected account page with first name, last name, email, logout, and change password link.
- Old `/dashboard`, `/recipes`, and `/planner` paths redirect into the `/app` route group.
- Unknown routes: 404 page.

## Protected Route Behavior

- Logged-in users with a valid stored JWT can access `/app`, recipes, planner, and account pages.
- Logged-out users are redirected to `/login`.
- Expired JWT-shaped tokens are cleared and redirected to `/login?session=expired`.
- Logout clears `token_data` and `user_data`, then returns to `/login`.

## Validation

- Required fields show visible field-level errors.
- Invalid email values show `Enter a valid email address.`
- Weak passwords show `Password is too weak. Use at least 8 characters with a letter and a number.`
- Password confirmation mismatch shows `Passwords must match.`
- Missing registration terms checkbox shows `You must agree to the terms.`
- Recipe forms require recipe name, description, at least one ingredient string, valid meal type, at least one instruction, prep time greater than zero, and servings greater than zero.

## Protected Page States

- Recipe pages show loading, no recipes yet, search returned no recipes, failed to load recipes, and recipe not found states.
- Weekly planner shows loading, weekly plan has no meals yet, failed to load weekly plan, failed save, and failed remove states.
- Dashboard shows loading and failed load states.

## API Integration

- `VITE_API_BASE_URL` configures the API root and defaults to `http://localhost:5000/api`.
- `frontend/src/api/authApi.ts` uses `/api/login` and `/api/register`.
- `frontend/src/api/recipeApi.ts` uses the protected `/api/recipes/list`, `/get`, `/create`, `/update`, and `/delete` routes.
- `frontend/src/api/mealPlanApi.ts` uses the protected `/api/mealplans/get` and `/save` routes.
- Recipe ingredients follow the API schema as `string[]`.
- Email verification, resend verification, forgot-password delivery, and reset-password submission remain UI-only because the API branch does not define matching routes yet.
- No component reads or writes MongoDB directly.
