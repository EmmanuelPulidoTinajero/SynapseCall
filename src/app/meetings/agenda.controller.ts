import { Request, Response } from 'express';
import Agenda from './agenda.model';
import AgendaItem from './agenda-item.model';
import Meeting from './meetings.model';

export const getAgenda = async (req: Request, res: Response) => {
    try {
        const { meetingId } = req.params;
        let agenda = await Agenda.findOne({ meeting_id: meetingId });

        if (!agenda) {
            return res.status(200).json({ items: [] });
        }

        const items = await AgendaItem.find({ agenda_id: agenda._id }).sort({ order: 1 });
        return res.status(200).json({ agenda, items });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener la agenda" });
    }
};

export const addAgendaItem = async (req: Request, res: Response) => {
    try {
        const { meetingId } = req.params;
        const { topic, durationInMinutes, order } = req.body;

        let agenda = await Agenda.findOne({ meeting_id: meetingId });
        if (!agenda) {
            agenda = await Agenda.create({ meeting_id: meetingId });
        }

        const newItem = await AgendaItem.create({
            agenda_id: agenda._id,
            topic,
            durationInMinutes,
            order,
            status: 'pending'
        });

        return res.status(201).json(newItem);
    } catch (error) {
        return res.status(500).json({ message: "Error al agregar tema" });
    }
};

export const updateAgendaItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const updates = req.body;
        const updated = await AgendaItem.findByIdAndUpdate(itemId, updates, { new: true });
        return res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar tema" });
    }
};

export const deleteAgendaItem = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        await AgendaItem.findByIdAndDelete(itemId);
        return res.status(200).json({ message: "Tema eliminado" });
    } catch (error) {
        return res.status(500).json({ message: "Error al eliminar tema" });
    }
};