import { Schema, model } from 'mongoose';

export default model(`users`, new Schema({
    _id: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    isEmailVerified: {
        type: Boolean,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }
}));