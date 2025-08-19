import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    // For credentials users
    username: { type: String, unique: true, sparse: true },
    passwordHash: { type: String },

    // Common fields
    name: { type: String },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    image: { type: String },

    // OAuth info
    provider: { type: String },
    providerId: { type: String },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
