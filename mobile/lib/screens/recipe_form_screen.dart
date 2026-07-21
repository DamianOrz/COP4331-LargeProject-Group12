import 'package:flutter/material.dart';
import '../models/recipe.dart';
import '../services/api_client.dart';
import '../services/recipe_service.dart';

// makes a recipe when nothing is passed or  edits the one given
class RecipeFormScreen extends StatefulWidget {
  final Recipe? existing;

  const RecipeFormScreen({super.key, this.existing});

  @override
  State<RecipeFormScreen> createState() => _RecipeFormScreenState();
}

class _RecipeFormScreenState extends State<RecipeFormScreen> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _descCtrl;
  late final TextEditingController _prepCtrl;
  late final TextEditingController _servingsCtrl;
  late final TextEditingController _ingredientsCtrl;
  late final TextEditingController _instructionsCtrl;

  late String _mealType;
  bool _saving = false;
  String? _error;

  bool get _isEditing => widget.existing != null;

  @override
  void initState() {
    super.initState();
    final r = widget.existing;
    _nameCtrl = TextEditingController(text: r?.recipeName ?? '');
    _descCtrl = TextEditingController(text: r?.description ?? '');
    _prepCtrl = TextEditingController(text: r?.prepTime.toString() ?? '');
    _servingsCtrl = TextEditingController(text: r?.servings.toString() ?? '');
    _ingredientsCtrl =
        TextEditingController(text: (r?.ingredients ?? []).join('\n'));
    _instructionsCtrl =
        TextEditingController(text: (r?.instructions ?? []).join('\n'));
    _mealType = (r?.mealType.isNotEmpty ?? false) ? r!.mealType : kMealTypes.first;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _prepCtrl.dispose();
    _servingsCtrl.dispose();
    _ingredientsCtrl.dispose();
    _instructionsCtrl.dispose();
    super.dispose();
  }

  List<String> _lines(TextEditingController ctrl) => ctrl.text
      .split('\n')
      .map((l) => l.trim())
      .where((l) => l.isNotEmpty)
      .toList();

  Future<void> _save() async {
    if (_nameCtrl.text.trim().isEmpty) {
      setState(() => _error = 'Recipe name is required.');
      return;
    }

    setState(() {
      _saving = true;
      _error = null;
    });

    final recipe = Recipe(
      id: widget.existing?.id ?? '',
      userId: '',
      recipeName: _nameCtrl.text.trim(),
      description: _descCtrl.text.trim(),
      ingredients: _lines(_ingredientsCtrl),
      instructions: _lines(_instructionsCtrl),
      mealType: _mealType,
      prepTime: int.tryParse(_prepCtrl.text.trim()) ?? 0,
      servings: int.tryParse(_servingsCtrl.text.trim()) ?? 1,
    );

    try {
      if (_isEditing) {
        await updateRecipe(widget.existing!.id, recipe);
      } else {
        await createRecipe(recipe);
      }
      if (!mounted) return;
      Navigator.of(context).pop(true);
    } on ApiError catch (e) {
      if (!mounted) return;
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_isEditing ? 'Edit recipe' : 'New recipe')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _nameCtrl,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(
              labelText: 'Recipe name',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _descCtrl,
            maxLines: 2,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(
              labelText: 'Description',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _mealType,
            decoration: const InputDecoration(
              labelText: 'Meal type',
              border: OutlineInputBorder(),
            ),
            items: kMealTypes
                .map((t) => DropdownMenuItem(
                      value: t,
                      child: Text(t[0].toUpperCase() + t.substring(1)),
                    ))
                .toList(),
            onChanged: (v) {
              if (v != null) setState(() => _mealType = v);
            },
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _prepCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Prep time (min)',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: TextField(
                  controller: _servingsCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Servings',
                    border: OutlineInputBorder(),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _ingredientsCtrl,
            maxLines: 5,
            decoration: const InputDecoration(
              labelText: 'Ingredients',
              helperText: 'One per line',
              border: OutlineInputBorder(),
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _instructionsCtrl,
            maxLines: 5,
            decoration: const InputDecoration(
              labelText: 'Instructions',
              helperText: 'One step per line',
              border: OutlineInputBorder(),
              alignLabelWithHint: true,
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 16),
            Text(_error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ],
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text(_isEditing ? 'Save changes' : 'Create recipe'),
          ),
        ],
      ),
    );
  }
}
