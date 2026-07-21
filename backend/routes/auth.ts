import { Router, type Request, type Response } from 'express';
import users from '../schema/users';
import { createToken } from '../jwt'
import { randomUUIDv7 } from 'bun';

const r = Router();

r.post(`/login`, async (req: Request, res: Response) => {
    const { login, password } = req.body;

    const user = await users.findOne({ email: login, passwordHash: password });

    if(!user) {
        return res.status(401).json({ error: `Invalid Credentials` })
    }

    const accessToken = createToken(user.firstName, user.lastName, user._id, user.email);
    if(!accessToken) {
        return res.status(500).json({ error: `Unable to create access token` });
    }

    // Returning user info alongside the token
    res.json({ accessToken, userId: user._id.toString(), firstName: user.firstName });
});

r.post(`/register`, async (req: Request, res: Response) => {
    const { firstName, lastName, email, password } = req.body;

    const exists = await users.findOne({ email });
    if(exists) {
        return res.status(403).json({ error: `Account already exists` });
    }

    // Mongoose handles _id and timestamps automatically.
    const newUser = {
        firstName,
        lastName,
        email,
        passwordHash: password,
        isEmailVerified: false,
    }
    // await users.insertOne(newUser); // REMOVED
    // Use the Mongoose .create() method to correctly save the new user.
    await users.create(newUser);
    res.status(201).json({ message: `Account created successfully` });
});

export default r;
