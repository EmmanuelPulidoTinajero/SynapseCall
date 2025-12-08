"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    sender_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    meeting_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Meeting', required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});
const Message = (0, mongoose_1.model)('Message', messageSchema);
exports.default = Message;
