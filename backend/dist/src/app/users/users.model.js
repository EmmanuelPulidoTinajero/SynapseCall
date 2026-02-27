"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    refresh_tokens: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization' },
    personalSubscription: {
        status: {
            type: String,
            enum: ['active', 'inactive', 'past_due'],
            default: 'inactive'
        },
        plan: {
            type: String,
            enum: ['individual_pro', 'free'],
            default: 'free'
        },
        expiresAt: { type: Date },
        paypalSubscriptionId: { type: String }
    }
});
const User = (0, mongoose_1.model)('User', userSchema);
exports.default = User;
