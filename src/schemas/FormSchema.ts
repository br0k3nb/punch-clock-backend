import mongoose from 'mongoose';

export default new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    projectsWorkedOn: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    questions: {
        type: String,
        required: false
    },
    screenshots: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: Date
});