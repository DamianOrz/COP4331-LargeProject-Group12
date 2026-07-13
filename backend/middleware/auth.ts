import type { Request, Response, NextFunction } from 'express';

import * as token from '../jwt'; 

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const { jwtToken } = req.body;

    if (jwtToken && token.isExpired(jwtToken)) {
        return res.status(200).json({ error: "The JWT is no longer valid", jwtToken: '' });
    }

    const refreshed = jwtToken.accessToken? token.refresh(jwtToken) : null;
    res.locals.refreshedToken = refreshed ?? '';
    
    next();
};