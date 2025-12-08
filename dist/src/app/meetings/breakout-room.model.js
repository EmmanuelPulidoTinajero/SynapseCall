"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const breakoutRoomSchema = new mongoose_1.Schema({
    meeting_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Meeting', required: true },
    roomName: { type: String, required: true },
});
const BreakoutRoom = (0, mongoose_1.model)('BreakoutRoom', breakoutRoomSchema);
exports.default = BreakoutRoom;
