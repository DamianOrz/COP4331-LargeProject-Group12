import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/meal_plan.dart';
import 'package:mobile/models/recipe.dart';
import 'package:mobile/services/api_client.dart';

// Unit tests for the meal prep mobile app.
//
// These target pure logic only: JSON parsing, meal plan slot handling,
// week calculation, and error classification. No network calls and no
// database, so each test runs in milliseconds and gives the same result
// every time.
//
// Each test follows Arrange - Act - Assert.

void main() {
  group('Recipe.fromJson', () {
    test('parses a complete recipe from API JSON', () {
      // Arrange
      final json = {
        '_id': 'abc123',
        'userId': 'user-1',
        'recipeName': 'Overnight Oats',
        'description': 'No-cook breakfast',
        'ingredients': ['1/2 cup oats', '1/2 cup milk'],
        'instructions': ['Combine in a jar', 'Refrigerate overnight'],
        'mealType': 'breakfast',
        'prepTime': 5,
        'servings': 1,
      };

      // Act
      final recipe = Recipe.fromJson(json);

      // Assert
      expect(recipe.id, 'abc123');
      expect(recipe.recipeName, 'Overnight Oats');
      expect(recipe.ingredients.length, 2);
      expect(recipe.instructions.first, 'Combine in a jar');
      expect(recipe.mealType, 'breakfast');
      expect(recipe.prepTime, 5);
      expect(recipe.servings, 1);
    });

    test('supplies safe defaults when fields are missing', () {
      // Arrange: the API omits optional fields on some records
      final json = <String, dynamic>{'_id': 'abc123'};

      // Act
      final recipe = Recipe.fromJson(json);

      // Assert: no exception, and empty rather than null
      expect(recipe.recipeName, '');
      expect(recipe.description, '');
      expect(recipe.ingredients, isEmpty);
      expect(recipe.instructions, isEmpty);
      expect(recipe.prepTime, 0);
      expect(recipe.servings, 1);
    });

    test('converts numeric fields sent as strings', () {
      // Arrange: form input can arrive as text
      final json = {
        '_id': 'abc123',
        'prepTime': '25',
        'servings': '4',
      };

      // Act
      final recipe = Recipe.fromJson(json);

      // Assert
      expect(recipe.prepTime, 25);
      expect(recipe.servings, 4);
    });

    test('drops empty strings from ingredient lists', () {
      // Arrange: blank lines in the recipe form produce empty entries
      final json = {
        '_id': 'abc123',
        'ingredients': ['Eggs', '', 'Butter', ''],
      };

      // Act
      final recipe = Recipe.fromJson(json);

      // Assert
      expect(recipe.ingredients, ['Eggs', 'Butter']);
    });
  });

  group('Recipe.toJson', () {
    test('includes the user id required by the create endpoint', () {
      // Arrange
      final recipe = Recipe(
        id: '',
        userId: '',
        recipeName: 'Chili',
        description: 'Weeknight chili',
        ingredients: ['Beans'],
        instructions: ['Simmer'],
        mealType: 'dinner',
        prepTime: 40,
        servings: 6,
      );

      // Act
      final json = recipe.toJson('user-99');

      // Assert
      expect(json['userId'], 'user-99');
      expect(json['recipeName'], 'Chili');
      expect(json['mealType'], 'dinner');
      expect(json['prepTime'], 40);
    });
  });

  group('MealPlan.mealFor', () {
    test('finds the meal assigned to a given day and meal type', () {
      // Arrange
      final plan = MealPlan(
        userId: 'user-1',
        weekStartDate: '2026-07-20',
        plannedMeals: [
          PlannedMeal(
            dayOfWeek: 'Monday',
            mealType: 'breakfast',
            recipeId: 'recipe-1',
          ),
          PlannedMeal(
            dayOfWeek: 'Tuesday',
            mealType: 'dinner',
            recipeId: 'recipe-2',
          ),
        ],
      );

      // Act
      final found = plan.mealFor('Tuesday', 'dinner');

      // Assert
      expect(found, isNotNull);
      expect(found!.recipeId, 'recipe-2');
    });

    test('returns null for an empty slot', () {
      // Arrange
      final plan = MealPlan(
        userId: 'user-1',
        weekStartDate: '2026-07-20',
        plannedMeals: [],
      );

      // Act
      final found = plan.mealFor('Wednesday', 'lunch');

      // Assert
      expect(found, isNull);
    });

    test('does not match a different meal type on the same day', () {
      // Arrange
      final plan = MealPlan(
        userId: 'user-1',
        weekStartDate: '2026-07-20',
        plannedMeals: [
          PlannedMeal(
            dayOfWeek: 'Monday',
            mealType: 'breakfast',
            recipeId: 'recipe-1',
          ),
        ],
      );

      // Act
      final found = plan.mealFor('Monday', 'dinner');

      // Assert
      expect(found, isNull);
    });
  });

  group('MealPlan.withAssignment', () {
    test('adds a recipe to an empty slot', () {
      // Arrange
      final plan = MealPlan(
        userId: 'user-1',
        weekStartDate: '2026-07-20',
        plannedMeals: [],
      );

      // Act
      final updated = plan.withAssignment('Friday', 'lunch', 'recipe-7');

      // Assert
      expect(updated.plannedMeals.length, 1);
      expect(updated.mealFor('Friday', 'lunch')!.recipeId, 'recipe-7');
    });

    test('replaces the recipe in an occupied slot rather than duplicating it', () {
      // Arrange
      final plan = MealPlan(
        userId: 'user-1',
        weekStartDate: '2026-07-20',
        plannedMeals: [
          PlannedMeal(
            dayOfWeek: 'Friday',
            mealType: 'lunch',
            recipeId: 'old-recipe',
          ),
        ],
      );

      // Act
      final updated = plan.withAssignment('Friday', 'lunch', 'new-recipe');

      // Assert
      expect(updated.plannedMeals.length, 1);
      expect(updated.mealFor('Friday', 'lunch')!.recipeId, 'new-recipe');
    });

    test('clears a slot when given a null recipe id', () {
      // Arrange
      final plan = MealPlan(
        userId: 'user-1',
        weekStartDate: '2026-07-20',
        plannedMeals: [
          PlannedMeal(
            dayOfWeek: 'Friday',
            mealType: 'lunch',
            recipeId: 'recipe-7',
          ),
        ],
      );

      // Act
      final updated = plan.withAssignment('Friday', 'lunch', null);

      // Assert
      expect(updated.plannedMeals, isEmpty);
      expect(updated.mealFor('Friday', 'lunch'), isNull);
    });

    test('leaves other slots untouched', () {
      // Arrange
      final plan = MealPlan(
        userId: 'user-1',
        weekStartDate: '2026-07-20',
        plannedMeals: [
          PlannedMeal(
            dayOfWeek: 'Monday',
            mealType: 'breakfast',
            recipeId: 'recipe-1',
          ),
        ],
      );

      // Act
      final updated = plan.withAssignment('Monday', 'dinner', 'recipe-2');

      // Assert
      expect(updated.plannedMeals.length, 2);
      expect(updated.mealFor('Monday', 'breakfast')!.recipeId, 'recipe-1');
      expect(updated.mealFor('Monday', 'dinner')!.recipeId, 'recipe-2');
    });

    test('does not modify the original plan', () {
      // Arrange: the planner relies on this to roll back a failed save
      final plan = MealPlan(
        userId: 'user-1',
        weekStartDate: '2026-07-20',
        plannedMeals: [],
      );

      // Act
      plan.withAssignment('Sunday', 'dinner', 'recipe-3');

      // Assert
      expect(plan.plannedMeals, isEmpty);
    });
  });

  group('MealPlan.fromJson', () {
    test('parses a saved plan with its meals', () {
      // Arrange
      final json = {
        '_id': 'plan-1',
        'userId': 'user-1',
        'weekStartDate': '2026-07-20',
        'plannedMeals': [
          {
            'dayOfWeek': 'Monday',
            'mealType': 'dinner',
            'recipeId': 'recipe-1',
            'notes': 'Double the batch',
          },
        ],
      };

      // Act
      final plan = MealPlan.fromJson(json);

      // Assert
      expect(plan.userId, 'user-1');
      expect(plan.weekStartDate, '2026-07-20');
      expect(plan.plannedMeals.length, 1);
      expect(plan.plannedMeals.first.notes, 'Double the batch');
    });

    test('returns an empty meal list when the field is absent', () {
      // Arrange: the API returns a bare plan for an unplanned week
      final json = {'userId': 'user-1', 'weekStartDate': '2026-07-20'};

      // Act
      final plan = MealPlan.fromJson(json);

      // Assert
      expect(plan.plannedMeals, isEmpty);
    });
  });

  group('currentWeekStartDate', () {
    test('returns a Monday', () {
      // Arrange & Act
      final result = currentWeekStartDate();

      // Assert
      expect(DateTime.parse(result).weekday, DateTime.monday);
    });

    test('formats the date as yyyy-MM-dd', () {
      // Arrange & Act
      final result = currentWeekStartDate();

      // Assert
      expect(RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(result), isTrue);
    });
  });

  group('ApiError', () {
    test('flags a 401 as an authentication failure', () {
      // Arrange
      final error = ApiError('The JWT is no longer valid.', 401);

      // Act & Assert
      expect(error.isAuthError, isTrue);
    });

    test('does not flag a 404 as an authentication failure', () {
      // Arrange
      final error = ApiError('Recipe not found.', 404);

      // Act & Assert
      expect(error.isAuthError, isFalse);
    });

    test('exposes the message through toString for display', () {
      // Arrange
      final error = ApiError('Could not reach the server.', 0);

      // Act & Assert
      expect(error.toString(), 'Could not reach the server.');
    });
  });

  group('kWeekdays and kMealTypes', () {
    test('covers a full seven day week starting Monday', () {
      // Arrange & Act & Assert
      expect(kWeekdays.length, 7);
      expect(kWeekdays.first, 'Monday');
      expect(kWeekdays.last, 'Sunday');
    });

    test('lists meal types in the order they occur during a day', () {
      // Arrange & Act & Assert
      expect(kMealTypes, ['breakfast', 'lunch', 'dinner']);
    });
  });
}
