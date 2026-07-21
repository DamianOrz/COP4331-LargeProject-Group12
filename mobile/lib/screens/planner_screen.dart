import 'package:flutter/material.dart';
import '../models/meal_plan.dart';
import '../models/recipe.dart';
import '../services/api_client.dart';
import '../services/meal_plan_service.dart';
import '../services/recipe_service.dart';

//7-column table didn't fit my phone,
// so this shows one card per day with a row for each meal.
// [MIGHT CHANGE LATER] Landscappe mode????
class PlannerScreen extends StatefulWidget {
  const PlannerScreen({super.key});

  @override
  State<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends State<PlannerScreen> {
  MealPlan? _plan;
  List<Recipe> _recipes = [];
  bool _loading = true;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      //the recipes supply the names.
      final results = await Future.wait([
        getWeeklyMealPlan(),
        listRecipes(),
      ]);
      if (!mounted) return;
      setState(() {
        _plan = results[0] as MealPlan;
        _recipes = results[1] as List<Recipe>;
      });
    } on ApiError catch (e) {
      if (!mounted) return;
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _recipeName(String recipeId) {
    for (final r in _recipes) {
      if (r.id == recipeId) return r.recipeName;
    }
    return 'Unknown recipe';
  }

  Future<void> _assign(String day, String mealType, String? recipeId) async {
    final plan = _plan;
    if (plan == null) return;

    final updated = plan.withAssignment(day, mealType, recipeId);

    setState(() {
      _plan = updated; // show right away
      _saving = true;
    });

    try {
      final saved = await saveMealPlan(updated);
      if (!mounted) return;
      setState(() => _plan = saved);
    } on ApiError catch (e) {
      if (!mounted) return;
      setState(() => _plan = plan); // !!put it back if the save failed
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _pickRecipe(String day, String mealType) async {
    if (_recipes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add a recipe first.')),
      );
      return;
    }

    final current = _plan?.mealFor(day, mealType)?.recipeId;

    final selected = await showModalBottomSheet<String?>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text('$day \u2014 $mealType',
                  style: Theme.of(ctx).textTheme.titleMedium),
            ),
            const Divider(height: 1),
            Flexible(
              child: ListView(
                shrinkWrap: true,
                children: [
                  if (current != null && current.isNotEmpty)
                    ListTile(
                      leading: const Icon(Icons.clear),
                      title: const Text('Clear this slot'),
                      onTap: () => Navigator.of(ctx).pop(''),
                    ),
                  ..._recipes.map(
                    (r) => ListTile(
                      title: Text(r.recipeName),
                      subtitle: Text(r.mealType),
                      trailing:
                          r.id == current ? const Icon(Icons.check) : null,
                      onTap: () => Navigator.of(ctx).pop(r.id),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );

    // Nothing chosen means the sheet was dismissed.
    if (selected == null) return;
    await _assign(day, mealType, selected.isEmpty ? null : selected);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('This Week'),
        bottom: _saving
            ? const PreferredSize(
                preferredSize: Size.fromHeight(2),
                child: LinearProgressIndicator(minHeight: 2),
              )
            : null,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) return const Center(child: CircularProgressIndicator());

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(_error!, textAlign: TextAlign.center),
              const SizedBox(height: 16),
              FilledButton(onPressed: _load, child: const Text('Retry')),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        itemCount: kWeekdays.length,
        itemBuilder: (context, i) {
          final day = kWeekdays[i];
          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                    child: Text(day,
                        style: Theme.of(context).textTheme.titleMedium),
                  ),
                  ...kMealTypes.map((mealType) {
                    final meal = _plan?.mealFor(day, mealType);
                    final assigned = meal != null && meal.recipeId.isNotEmpty;

                    return ListTile(
                      dense: true,
                      title: Text(
                        mealType[0].toUpperCase() + mealType.substring(1),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      subtitle: Text(
                        assigned
                            ? _recipeName(meal.recipeId)
                            : 'Tap to add a recipe',
                        style: TextStyle(
                          fontStyle:
                              assigned ? FontStyle.normal : FontStyle.italic,
                          color:
                              assigned ? null : Theme.of(context).disabledColor,
                        ),
                      ),
                      trailing:
                          Icon(assigned ? Icons.edit : Icons.add, size: 18),
                      onTap: () => _pickRecipe(day, mealType),
                    );
                  }),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
