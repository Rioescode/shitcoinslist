import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
