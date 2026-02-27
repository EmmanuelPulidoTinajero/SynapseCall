"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const agendaSchema = new mongoose_1.Schema({
    meeting_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Meeting', required: true },
    currentItemIndex: { type: Number, default: 0 },
    isAutoAdvanceEnabled: { type: Boolean, default: false },
});
const Agenda = (0, mongoose_1.model)('Agenda', agendaSchema);
exports.default = Agenda;
