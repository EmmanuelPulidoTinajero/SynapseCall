"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const meetingSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'ended'],
        default: 'scheduled',
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    initiator_id: { type: String, required: true },
    isProMeeting: { type: Boolean, default: false },
    meetingSettings: {
        muteOnEntry: { type: Boolean, default: false },
        allowRenaming: { type: Boolean, default: true },
        lockMeeting: { type: Boolean, default: false }
    }
});
const Meeting = (0, mongoose_1.model)('Meeting', meetingSchema);
exports.default = Meeting;
