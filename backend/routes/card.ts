import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import Card from '../schema/card';

const router = Router();

router.post('/addcard', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId, card } = req.body;
        await Card.create({ Card: card, UserId: userId });
        
        // Changed to 201 Created
        res.status(201).json({ error: '', jwtToken: res.locals.refreshedToken });
    } catch (e: any) {
        res.status(500).json({ error: e.toString(), jwtToken: res.locals.refreshedToken });
    }
});

router.post('/searchcards', requireAuth, async (req: Request, res: Response) => {
    try {
        const { userId, search } = req.body;
        const _search = search.trim();
        
        const results = await Card.find({
            Card: { $regex: _search + '.*', $options: 'i' },
            UserId: userId
        });

        const _ret = results.map((r: any) => r.Card);
        res.status(200).json({ results: _ret, error: '', jwtToken: res.locals.refreshedToken });
    } catch (e: any) {
        res.status(500).json({ results: [], error: e.toString(), jwtToken: res.locals.refreshedToken });
    }
});

export default router;