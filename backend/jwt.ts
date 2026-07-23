import jwt from 'jsonwebtoken';

export interface AccessTokenPayload extends jwt.JwtPayload {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
}

export function createToken(firstName: string, lastName: string, userId: string, email: string) {
    try {
        const user = {
            userId,
            firstName,
            lastName,
            email
        };
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '30m'})

        return token;
    } catch(e) {
        console.error(e);
    }
}

export function isExpired(token: string): boolean {
    return verifyToken(token) === null;
}

export function verifyToken(token: string): AccessTokenPayload | null {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as AccessTokenPayload;
    } catch {
        return null;
    }
}

export function refresh(token: string) {
    const payload = verifyToken(token);
    if(!payload) return null;
    const { userId, firstName, lastName, email } = payload;
    return createToken(firstName, lastName, userId, email);
}
