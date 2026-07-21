
class Recipe {
  final String id;
  final String userId;
  final String recipeName;
  final String description;
  final List<String> ingredients;
  final List<String> instructions;
  final String mealType;
  final int prepTime;
  final int servings;

  Recipe({
    required this.id,
    required this.userId,
    required this.recipeName,
    required this.description,
    required this.ingredients,
    required this.instructions,
    required this.mealType,
    required this.prepTime,
    required this.servings,
  });

  factory Recipe.fromJson(Map<String, dynamic> json) {
    return Recipe(
      id: (json['_id'] ?? '').toString(),
      userId: (json['userId'] ?? '').toString(),
      recipeName: (json['recipeName'] ?? '') as String,
      description: (json['description'] ?? '') as String,
      ingredients: _stringList(json['ingredients']),
      instructions: _stringList(json['instructions']),
      mealType: (json['mealType'] ?? '') as String,
      prepTime: _toInt(json['prepTime']),
      servings: _toInt(json['servings'], fallback: 1),
    );
  }

  //  used when creating or updating.
  Map<String, dynamic> toJson(String userId) => {
        'userId': userId,
        'recipeName': recipeName,
        'description': description,
        'ingredients': ingredients,
        'instructions': instructions,
        'mealType': mealType,
        'prepTime': prepTime,
        'servings': servings,
      };

  static List<String> _stringList(dynamic value) {
    if (value is List) {
      return value.map((e) => e.toString()).where((e) => e.isNotEmpty).toList();
    }
    return [];
  }

  static int _toInt(dynamic value, {int fallback = 0}) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value) ?? fallback;
    return fallback;
  }
}

const List<String> kMealTypes = ['breakfast', 'lunch', 'dinner'];
