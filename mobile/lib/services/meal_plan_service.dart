import '../models/meal_plan.dart';
import 'api_client.dart';
import 'auth_session.dart';

Future<MealPlan> getWeeklyMealPlan({String? weekStartDate}) async {
  final userId = AuthSession.instance.userId;
  if (userId == null) throw ApiError('Please log in to continue.', 401);

  final week = weekStartDate ?? currentWeekStartDate();

  final data = await postApi('mealplans/get', {
    'userId': userId,
    'weekStartDate': week,
  });

  final plan = data['mealPlan'];
  if (plan is! Map<String, dynamic>) {
    return MealPlan(userId: userId, weekStartDate: week, plannedMeals: []);
  }
  return MealPlan.fromJson(plan);
}

// The backend saves the whole plan document at once, so the
// complete list of planned meals goes up every time.
Future<MealPlan> saveMealPlan(MealPlan plan) async {
  final userId = AuthSession.instance.userId;
  if (userId == null) throw ApiError('Please log in to continue.', 401);

  final data = await postApi('mealplans/save', {
    'userId': userId,
    'weekStartDate': plan.weekStartDate,
    'plannedMeals': plan.plannedMeals.map((m) => m.toJson()).toList(),
  });

  final saved = data['mealPlan'];
  if (saved is! Map<String, dynamic>) {
    throw ApiError('Meal plan was not saved.', 500);
  }
  return MealPlan.fromJson(saved);
}
