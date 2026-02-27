"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const meetingParticipantSchema = new mongoose_1.Schema({
    meeting_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Meeting', required: true },
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
        type: String,
        enum: ['host', 'cohost', 'moderator', 'member', 'guest'],
        default: 'member',
    },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    displayName: { type: String, required: true },
    isMutedByHost: { type: Boolean, default: false }
});
const MeetingParticipant = (0, mongoose_1.model)('MeetingParticipant', meetingParticipantSchema);
exports.default = MeetingParticipant;
