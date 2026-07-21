import '../models/recipe.dart';
import 'api_client.dart';
import 'auth_session.dart';

Future<List<Recipe>> listRecipes({String? search, String? mealType}) async {
  final data = await postApi('recipes/list', {
    'userId': AuthSession.instance.userId,
    if (search != null && search.trim().isNotEmpty) 'search': search.trim(),
    if (mealType != null && mealType != 'all') 'mealType': mealType,
  });

  final recipes = data['recipes'];
  if (recipes is! List) return [];

  return recipes
      .whereType<Map<String, dynamic>>()
      .map(Recipe.fromJson)
      .toList();
}

Future<Recipe> getRecipe(String recipeId) async {
  final data = await postApi('recipes/get', {'recipeId': recipeId});
  final recipe = data['recipe'];
  if (recipe is! Map<String, dynamic>) {
    throw ApiError('Recipe not found.', 404);
  }
  return Recipe.fromJson(recipe);
}

Future<void> createRecipe(Recipe recipe) async {
  final userId = AuthSession.instance.userId;
  if (userId == null) throw ApiError('Please log in to continue.', 401);
  await postApi('recipes/create', recipe.toJson(userId));
}

Future<void> updateRecipe(String recipeId, Recipe recipe) async {
  final userId = AuthSession.instance.userId;
  if (userId == null) throw ApiError('Please log in to continue.', 401);
  await postApi('recipes/update', {
    'recipeId': recipeId,
    ...recipe.toJson(userId),
  });
}

Future<void> deleteRecipe(String recipeId) async {
  await postApi('recipes/delete', {'recipeId': recipeId});
}
