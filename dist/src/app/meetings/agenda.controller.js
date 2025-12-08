"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAgendaItem = exports.updateAgendaItem = exports.addAgendaItem = exports.getAgenda = void 0;
const agenda_model_1 = __importDefault(require("./agenda.model"));
const agenda_item_model_1 = __importDefault(require("./agenda-item.model"));
const getAgenda = async (req, res) => {
    try {
        const { meetingId } = req.params;
        let agenda = await agenda_model_1.default.findOne({ meeting_id: meetingId });
        if (!agenda) {
            return res.status(200).json({ items: [] });
        }
        const items = await agenda_item_model_1.default.find({ agenda_id: agenda._id }).sort({ order: 1 });
        return res.status(200).json({ agenda, items });
    }
    catch (error) {
        return res.status(500).json({ message: "Error al obtener la agenda" });
    }
};
exports.getAgenda = getAgenda;
const addAgendaItem = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { topic, durationInMinutes, order } = req.body;
        let agenda = await agenda_model_1.default.findOne({ meeting_id: meetingId });
        if (!agenda) {
            agenda = await agenda_model_1.default.create({ meeting_id: meetingId });
        }
        const newItem = await agenda_item_model_1.default.create({
            agenda_id: agenda._id,
            topic,
            durationInMinutes,
            order,
            status: 'pending'
        });
        return res.status(201).json(newItem);
    }
    catch (error) {
        return res.status(500).json({ message: "Error al agregar tema" });
    }
};
exports.addAgendaItem = addAgendaItem;
const updateAgendaItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const updates = req.body;
        const updated = await agenda_item_model_1.default.findByIdAndUpdate(itemId, updates, { new: true });
        return res.status(200).json(updated);
    }
    catch (error) {
        return res.status(500).json({ message: "Error al actualizar tema" });
    }
};
exports.updateAgendaItem = updateAgendaItem;
const deleteAgendaItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        await agenda_item_model_1.default.findByIdAndDelete(itemId);
        return res.status(200).json({ message: "Tema eliminado" });
    }
    catch (error) {
        return res.status(500).json({ message: "Error al eliminar tema" });
    }
};
exports.deleteAgendaItem = deleteAgendaItem;
