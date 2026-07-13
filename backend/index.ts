import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv';

import recipeRoutes from './routes/recipes';
import mealplanRoutes from './routes/mealplan';
import cardRoutes from './routes/card';
import authRoutes from './routes/auth';

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors({
    origin: `*`,
    methods: [`GET`, `POST`]
}));
app.use(express.json());

const url = process.env.MONGODB_URI;

app.use(`/api/recipes`, recipeRoutes);
app.use(`/api/mealplans`, mealplanRoutes);
app.use(`/api`, cardRoutes)
app.use(`/api`, authRoutes)

mongoose
    .connect(url!)
    .then(() => {
        console.log(`MongoDB connected`)
    })
    .catch(console.error);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})