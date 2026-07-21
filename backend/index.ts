import './patch'; // Apply Bun compatibility patch first
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';

import recipeRoutes from './routes/recipes';
import mealplanRoutes from './routes/mealplan';
import cardRoutes from './routes/card';
import authRoutes from './routes/auth';

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors({
    origin: `*`,
    methods: [`GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`]
}));
app.use(express.json());

const url = process.env.MONGODB_URI;

app.use(`/api/recipes`, recipeRoutes);
app.use(`/api/mealplans`, mealplanRoutes);
app.use(`/api/cards`, cardRoutes); // Isolate legacy card routes
app.use(`/api`, authRoutes); // Main auth routes (login, register)

mongoose
    .connect(url!)
    .then(() => {
        console.log(`MongoDB connected`)
    })
    .catch(console.error);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})