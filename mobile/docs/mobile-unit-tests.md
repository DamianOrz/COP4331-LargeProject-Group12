# Mobile App — Unit Testing

Unit tests for the Flutter mobile client (`mobile/`).

## Running the tests

```bash
cd mobile
flutter test
```

With coverage:

```bash
flutter test --coverage
```

## What is tested

22 tests across 8 groups, all in `mobile/test/unit_test.dart`.

| Group | What it covers |
|---|---|
| `Recipe.fromJson` | Parsing API responses, missing fields, string-to-number conversion, empty ingredient filtering |
| `Recipe.toJson` | Building the create/update request body |
| `MealPlan.mealFor` | Finding the recipe in a given day + meal slot |
| `MealPlan.withAssignment` | Adding, replacing, and clearing meal assignments |
| `MealPlan.fromJson` | Parsing a saved week, and an unplanned week |
| `currentWeekStartDate` | Week calculation returns a correctly formatted Monday |
| `ApiError` | Classifying auth failures vs. other errors |
| `kWeekdays` / `kMealTypes` | Day and meal ordering constants |

## Why these units

The tests target **pure logic** — data parsing and meal-plan slot handling.
No network calls, no database, no UI. This keeps them fast and deterministic,
and it means a failing test points at a specific function rather than at a
flaky server.

The trade-off is that screens and API calls are covered by manual testing
rather than automated tests. See *Not covered* below.

## Test structure

Every test follows **Arrange – Act – Assert**:

```dart
test('replaces the recipe in an occupied slot rather than duplicating it', () {
  // Arrange
  final plan = MealPlan(
    userId: 'user-1',
    weekStartDate: '2026-07-20',
    plannedMeals: [
      PlannedMeal(dayOfWeek: 'Friday', mealType: 'lunch', recipeId: 'old-recipe'),
    ],
  );

  // Act
  final updated = plan.withAssignment('Friday', 'lunch', 'new-recipe');

  // Assert
  expect(updated.plannedMeals.length, 1);
  expect(updated.mealFor('Friday', 'lunch')!.recipeId, 'new-recipe');
});
```

## FIRST principles

- **Fast** — no I/O, so the suite runs in under a second.
- **Isolated** — each test builds its own data and shares no state, so they
  can run in any order.
- **Repeatable** — no dependency on the network, the database, or on data
  another test created.
- **Self-validating** — each test passes or fails on its own assertions;
  nothing has to be checked by hand.
- **Timely** — written alongside the models rather than bolted on afterward.

## Cases worth calling out

**Defensive parsing.** The API sometimes omits optional fields, and form
input can arrive as strings rather than numbers. `Recipe.fromJson` is tested
against both so a malformed record shows an empty field instead of crashing
the recipe list.

**Immutability of the meal plan.** `withAssignment` returns a new plan rather
than mutating the existing one. The planner screen depends on this: it applies
the change immediately for responsiveness, then restores the original object
if the save request fails. A test asserts the original is untouched.

**No duplicate slots.** The backend stores one meal plan document per user per
week containing an array of meals, so nothing at the database level prevents
two entries for the same day and meal type. `withAssignment` removes any
existing entry before adding the new one, and a test covers it.

## Not covered

- Widget rendering
- Live API calls (`postApi` and the service functions)
- Token storage and expiry

These require either the Flutter widget test framework or mocked HTTP
responses. They were verified manually against a running backend:
register, login, create/edit/delete recipe, assign a meal, and confirm the
assignment persists after a refresh.

Automating these is the natural next step — mocking the HTTP client would
let the service layer be tested without a live server.
