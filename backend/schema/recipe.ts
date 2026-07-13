import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
    userId: mongoose.Types.ObjectId;
    recipeName: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    mealType: string;
    prepTime: number;
    servings: number;
    createdAt: Date;
}

const RecipeSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    recipeName: { type: String, required: true },
    description: { type: String, default: "" },
    ingredients: { type: [String], default: [] },
    instructions: { type: [String], default: [] },
    mealType: { type: String },
    prepTime: { type: Number, default: 0 },
    servings: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);