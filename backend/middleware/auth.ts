import type { Request, Response, NextFunction } from 'express';

import * as token from '../jwt'; 

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const { jwtToken } = req.body;

    const authUser = typeof jwtToken === 'string' ? token.verifyToken(jwtToken) : null;

    if (!authUser) {
        return res.status(401).json({ error: "The JWT is no longer valid", jwtToken: '' });
    }

    res.locals.authUser = authUser;
    res.locals.refreshedToken = token.refresh(jwtToken) ?? jwtToken;
    
    next();
};
