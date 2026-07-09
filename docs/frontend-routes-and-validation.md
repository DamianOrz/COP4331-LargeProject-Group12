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
- `/app/recipes`: Protected recipe list with mock data, search, filter, edit, delete, and details links.
- `/app/recipes/new`: Protected create recipe form using the mock recipe service.
- `/app/recipes/:recipeId`: Protected recipe details page.
- `/app/recipes/:recipeId/edit`: Protected edit recipe form using the mock recipe service.
- `/app/planner`: Protected weekly planner grouped Monday through Sunday with recipe assignment.
- `/app/account`: Protected account page with first name, last name, email, logout, and change password link.
- Old `/dashboard`, `/recipes`, and `/planner` paths redirect into the `/app` route group.
- Unknown routes: 404 page.

## Protected Route Behavior

- Logged-in users with a stored token and user can access `/app`, recipes, planner, and account pages.
- Logged-out users are redirected to `/login`.
- Expired JWT-shaped tokens are cleared and redirected to `/login?session=expired`.
- Logout clears `token_data` and `user_data`, then returns to `/login`.

## Validation

- Required fields show visible field-level errors.
- Invalid email values show `Enter a valid email address.`
- Weak passwords show `Password is too weak. Use at least 8 characters with a letter and a number.`
- Password confirmation mismatch shows `Passwords must match.`
- Missing registration terms checkbox shows `You must agree to the terms.`
- Recipe forms require recipe name, description, at least one ingredient, ingredient names, positive ingredient quantities, valid meal type, at least one instruction, prep time greater than zero, and servings greater than zero.

## Protected Page States

- Recipe pages show loading, no recipes yet, search returned no recipes, failed to load recipes, and recipe not found states.
- Weekly planner shows loading, weekly plan has no meals yet, failed to load weekly plan, failed save, and failed remove states.
- Dashboard shows loading and failed load states.

## API Readiness

- Mock service now.
- Real Express API later.
- Keep the same exported function names.
- Keep the same expected response shapes.
- `frontend/src/api/authApi.ts` contains placeholder auth methods ready to swap to Express API calls.
- `frontend/src/api/recipeApi.ts` contains Promise-based mock recipe CRUD methods.
- `frontend/src/api/mealPlanApi.ts` contains Promise-based mock weekly meal planner methods.
- No component reads or writes MongoDB directly.
