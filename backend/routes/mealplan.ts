import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth';
import MealPlan from '../schema/mealplan';

const router = Router();

router.post('/get', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId, weekStartDate } = req.body;
        const query: any = { userId };
        
        if (weekStartDate) {
            query.weekStartDate = new Date(weekStartDate);
        }

        let plan = await MealPlan.findOne(query);
        
        if (!plan) {
            plan = new MealPlan({
                userId,
                weekStartDate: weekStartDate ? new Date(weekStartDate) : new Date(),
                plannedMeals: []
            });
        }

        res.status(200).json({ mealPlan: plan, error: '', jwtToken: res.locals.refreshedToken });
    } catch (e: any) {
        res.status(500).json({ mealPlan: null, error: e.toString(), jwtToken: '' });
    }
});

router.post('/save', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId, weekStartDate, plannedMeals } = req.body;
        
        const filter = { userId, weekStartDate: new Date(weekStartDate) };
        const updateDoc = {
            userId,
            weekStartDate: new Date(weekStartDate),
            plannedMeals: plannedMeals || []
        };

        const result = await MealPlan.findOneAndUpdate(
            filter,
            updateDoc,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ mealPlan: result, error: '', jwtToken: res.locals.refreshedToken });
    } catch (e: any) {
        res.status(500).json({ mealPlan: null, error: e.toString(), jwtToken: '' });
    }
});

export default router;