const List<String> kWeekdays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

class PlannedMeal {
  final String dayOfWeek;
  final String mealType;
  final String recipeId;
  final String notes;

  PlannedMeal({
    required this.dayOfWeek,
    required this.mealType,
    required this.recipeId,
    this.notes = '',
  });

  factory PlannedMeal.fromJson(Map<String, dynamic> json) => PlannedMeal(
        dayOfWeek: (json['dayOfWeek'] ?? '') as String,
        mealType: (json['mealType'] ?? '') as String,
        recipeId: (json['recipeId'] ?? '').toString(),
        notes: (json['notes'] ?? '') as String,
      );

  Map<String, dynamic> toJson() => {
        'dayOfWeek': dayOfWeek,
        'mealType': mealType,
        'recipeId': recipeId,
        'notes': notes,
      };
}

class MealPlan {
  final String userId;
  final String weekStartDate;
  final List<PlannedMeal> plannedMeals;

  MealPlan({
    required this.userId,
    required this.weekStartDate,
    required this.plannedMeals,
  });

  factory MealPlan.fromJson(Map<String, dynamic> json) {
    final meals = json['plannedMeals'];
    return MealPlan(
      userId: (json['userId'] ?? '').toString(),
      weekStartDate: (json['weekStartDate'] ?? '').toString(),
      plannedMeals: meals is List
          ? meals
              .whereType<Map<String, dynamic>>()
              .map(PlannedMeal.fromJson)
              .toList()
          : [],
    );
  }

  // find what's assigned to a given day and meal, if anything.
  PlannedMeal? mealFor(String dayOfWeek, String mealType) {
    for (final meal in plannedMeals) {
      if (meal.dayOfWeek == dayOfWeek && meal.mealType == mealType) return meal;
    }
    return null;
  }

  // Returns a copy with one slot changed. A null recipeId clears the slot.
  MealPlan withAssignment(String dayOfWeek, String mealType, String? recipeId) {
    final updated = plannedMeals
        .where((m) => !(m.dayOfWeek == dayOfWeek && m.mealType == mealType))
        .toList();

    if (recipeId != null && recipeId.isNotEmpty) {
      updated.add(PlannedMeal(
        dayOfWeek: dayOfWeek,
        mealType: mealType,
        recipeId: recipeId,
      ));
    }

    return MealPlan(
      userId: userId,
      weekStartDate: weekStartDate,
      plannedMeals: updated,
    );
  }
}

// Monday-start week
String currentWeekStartDate() {
  final now = DateTime.now();
  final monday = now.subtract(Duration(days: now.weekday - 1));
  final y = monday.year.toString().padLeft(4, '0');
  final m = monday.month.toString().padLeft(2, '0');
  final d = monday.day.toString().padLeft(2, '0');
  return '$y-$m-$d';
}
