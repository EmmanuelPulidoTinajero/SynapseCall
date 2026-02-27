"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const agendaItemSchema = new mongoose_1.Schema({
    agenda_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Agenda', required: true },
    topic: { type: String, required: true },
    durationInMinutes: { type: Number, required: true },
    presenter_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    order: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed'],
        default: 'pending'
    },
    actualStartTime: { type: Date }
});
const AgendaItem = (0, mongoose_1.model)('AgendaItem', agendaItemSchema);
exports.default = AgendaItem;
