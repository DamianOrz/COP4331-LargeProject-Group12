import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth';
import Recipe from '../schema/recipe';

const router = Router();

router.post('/list', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId, search, mealType } = req.body;
        const query: any = {};

        if (userId) query.userId = userId;
        
        if (search && search.trim() !== '') {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { recipeName: { $regex: regex } },
                { description: { $regex: regex } }
            ];
        }

        if (mealType && mealType !== 'all') {
            query.mealType = mealType;
        }

        const results = await Recipe.find(query).sort({ createdAt: -1 });
        res.status(200).json({ recipes: results, error: '', jwtToken: res.locals.refreshedToken });
    } catch (e: any) {
        // Changed to 500 Internal Server Error
        res.status(500).json({ recipes: [], error: e.toString(), jwtToken: '' });
    }
});

router.post('/get', requireAuth, async (req: Request, res: Response) => {
    try {
        const { recipeId } = req.body;
        const result = await Recipe.findById(recipeId);
        
        if (!result) {
            // Changed to 404 Not Found if recipe doesn't exist
            return res.status(404).json({ recipe: null, error: 'Recipe not found', jwtToken: res.locals.refreshedToken });
        }
        
        res.status(200).json({ recipe: result, error: '', jwtToken: res.locals.refreshedToken });
    } catch (e: any) {
        res.status(500).json({ recipe: null, error: e.toString(), jwtToken: '' });
    }
});

router.post('/create', requireAuth, async (req: Request, res: Response) => {
    try {
        const newRecipe = await Recipe.create(req.body); 
        // Changed to 201 Created
        res.status(201).json({ recipe: newRecipe, error: '', jwtToken: res.locals.refreshedToken });
    } catch (e: any) {
        res.status(500).json({ recipe: null, error: e.toString(), jwtToken: '' });
    }
});

router.post('/update', requireAuth, async (req: Request, res: Response) => {
    try {
        const { recipeId, ...updateFields } = req.body;
        const result = await Recipe.findByIdAndUpdate(recipeId, updateFields, { new: true });
        
        if (!result) {
            return res.status(404).json({ recipe: null, error: 'Recipe not found', jwtToken: res.locals.refreshedToken });
        }
        
        res.status(200).json({ recipe: result, error: '', jwtToken: res.locals.refreshedToken });
    } catch (e: any) {
        res.status(500).json({ recipe: null, error: e.toString(), jwtToken: '' });
    }
});

router.post('/delete', requireAuth, async (req: Request, res: Response) => {
    try {
        const { recipeId } = req.body;
        const result = await Recipe.findByIdAndDelete(recipeId);
        
        if (!result) {
            return res.status(404).json({ error: 'Recipe not found', jwtToken: res.locals.refreshedToken });
        }
        
        res.status(200).json({ error: '', jwtToken: res.locals.refreshedToken });
    } catch (e: any) {
        res.status(500).json({ error: e.toString(), jwtToken: '' });
    }
});

export default router;