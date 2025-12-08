"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const meetingSettingsSchema = new mongoose_1.Schema({
    meeting_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Meeting', required: true },
    hasWaitingRoom: { type: Boolean, default: false },
    isWhitelistEnabled: { type: Boolean, default: false },
    whitelist: { type: mongoose_1.Schema.Types.Mixed },
    allowParticipantsToAddAgendaItems: { type: Boolean, default: false },
    accessCode: { type: String },
});
const MeetingSettings = (0, mongoose_1.model)('MeetingSettings', meetingSettingsSchema);
exports.default = MeetingSettings;
