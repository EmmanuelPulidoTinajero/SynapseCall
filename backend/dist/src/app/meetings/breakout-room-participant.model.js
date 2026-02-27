"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const breakoutRoomParticipantSchema = new mongoose_1.Schema({
    breakout_room_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'BreakoutRoom', required: true },
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
});
const BreakoutRoomParticipant = (0, mongoose_1.model)('BreakoutRoomParticipant', breakoutRoomParticipantSchema);
exports.default = BreakoutRoomParticipant;
