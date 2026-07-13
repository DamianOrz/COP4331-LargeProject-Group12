import mongoose, { Schema, Document } from 'mongoose';

export interface IPlannedMeal {
    dayOfWeek: string;
    mealType: string;
    recipeId: mongoose.Types.ObjectId;
    plannedDate: string;
    notes: string;
}

export interface IMealPlan extends Document {
    userId: mongoose.Types.ObjectId;
    weekStartDate: Date;
    plannedMeals: IPlannedMeal[];
    createdAt: Date;
}

const PlannedMealSchema: Schema = new Schema({
    dayOfWeek: { type: String },
    mealType: { type: String },
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe' },
    plannedDate: { type: String, default: "" },
    notes: { type: String, default: "" }
}, { _id: false });

const MealPlanSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    weekStartDate: { type: Date, required: true },
    plannedMeals: { type: [PlannedMealSchema], default: [] },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IMealPlan>('MealPlan', MealPlanSchema, 'meal_plans');