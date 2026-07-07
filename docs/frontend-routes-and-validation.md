# Frontend Routes and Validation Notes

## Routes

- `/login`: Login form with email and password validation.
- `/register`: Registration form with name, email, password, confirm password, and terms checkbox validation.
- `/check-email`: Post-register verification reminder screen.
- `/verify-email` and `/verify-email-success`: Email verification success state.
- `/verify-email-invalid`: Invalid or expired verification state.
- `/forgot-password`: Password reset link request form.
- `/reset-password`: New password and confirm password form.
- `/dashboard`: Meal Planner dashboard shell with recipe and weekly plan summary.
- `/recipes`: Recipe list with mock data, search, filter, edit, delete, and details links.
- `/recipes/new`: Create recipe form using the mock recipe service.
- `/recipes/:id`: Recipe details page.
- `/recipes/:id/edit`: Edit recipe form using the mock recipe service.
- `/planner`: Weekly planner grouped Monday through Sunday with recipe assignment.
- Unknown routes: 404 page.

## Validation

- Required fields show visible field-level errors.
- Invalid email values show `Enter a valid email address.`
- Weak passwords show `Password is too weak. Use at least 8 characters with a letter and a number.`
- Password confirmation mismatch shows `Passwords must match.`
- Missing registration terms checkbox shows `You must agree to the terms.`
- Recipe forms require recipe name, description, at least one ingredient, at least one instruction, prep time greater than zero, and servings greater than zero.

## API Readiness

- `frontend/src/api/authApi.ts` contains placeholder auth methods ready to swap to Express API calls.
- `frontend/src/api/recipeApi.ts` contains Promise-based mock recipe CRUD methods.
- `frontend/src/api/mealPlanApi.ts` contains Promise-based mock weekly meal planner methods.
- No component reads or writes MongoDB directly.
