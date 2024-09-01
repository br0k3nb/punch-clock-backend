import mongoose from 'mongoose';

export default new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        required: false
    },
    workDays: {
        type: String,
        required: false
    },
    biometricData: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: Date
});