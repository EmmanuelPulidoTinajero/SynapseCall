"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const organizationSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    domain: { type: String },
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    logoUrl: { type: String },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    subscription: {
        status: {
            type: String,
            enum: ['active', 'inactive', 'past_due'],
            default: 'inactive'
        },
        plan: {
            type: String,
            enum: ['organization_tier', 'free'],
            default: 'free'
        },
        expiresAt: { type: Date },
        paypalSubscriptionId: { type: String }
    }
});
const Organization = (0, mongoose_1.model)('Organization', organizationSchema);
exports.default = Organization;
