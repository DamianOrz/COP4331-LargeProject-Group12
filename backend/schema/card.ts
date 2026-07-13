import mongoose, { Schema } from 'mongoose';

const CardSchema: Schema = new Schema({
    Card: { type: String, required: true },
    UserId: { type: String, required: true }
});

export default mongoose.model('Card', CardSchema, 'Cards');