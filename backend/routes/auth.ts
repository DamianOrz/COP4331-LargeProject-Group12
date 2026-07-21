import { Router, type Request, type Response } from 'express';
import users from '../schema/users';
import { createToken } from '../jwt'
import { randomUUIDv7 } from 'bun';

const r = Router();

r.post(`/login`, async (req: Request, res: Response) => {
    try {
        let { login, password } = req.body;
        
        login = (login || '').trim().toLowerCase();
        password = (password || '').trim();

        const user = await users.findOne({ email: login, passwordHash: password });

        if(!user) {
            return res.status(401).json({ error: `Invalid Credentials` })
        }

        // Ensure the user ID is a string
        const userId = user._id.toString();
        const accessToken = createToken(user.firstName, user.lastName, userId, user.email);

        if(!accessToken) {
            return res.status(500).json({ error: `Unable to create access token` });
        }

        // Returning user info alongside the token
        res.json({ accessToken, userId: user._id.toString(), firstName: user.firstName });
    } catch (e) {
        console.error("Login Error:", e);
        res.status(500).json({ error: "An internal server error occurred." });
    }
});

r.post(`/register`, async (req: Request, res: Response) => {
    try {
        let { firstName, lastName, email, password } = req.body;

        // Sanitize and normalize input
        email = (email || '').trim().toLowerCase();
        password = (password || '').trim();
        firstName = (firstName || '').trim();
        lastName = (lastName || '').trim();

        const exists = await users.findOne({ email: email });
        if(exists) {
            return res.status(403).json({ error: `Account already exists` });
        }

        const newUser = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            passwordHash: password,
        }

        // await users.insertOne(newUser); // REMOVED
        await users.create(newUser);
        res.status(201).json({ message: `Account created successfully` });
    } catch (e) {
        console.error("Registration Error:", e);
        res.status(500).json({ error: "An internal server error occurred." });
    }
});

export default r;
