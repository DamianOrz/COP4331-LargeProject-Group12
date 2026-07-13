import jwt from 'jsonwebtoken';

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
    try {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
        return false;
    } catch(e) {
        return true;
    }
}

export function refresh(token: string) {
    let ud = jwt.decode(token, { complete: true });
    if(!ud) return null;
    if(!ud.payload) return null;
    let { userId, firstName, lastName, email } = ud?.payload as jwt.JwtPayload;
    return createToken(firstName, lastName, userId, email);
}