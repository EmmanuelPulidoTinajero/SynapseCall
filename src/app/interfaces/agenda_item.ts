import { Schema } from "mongoose";

export interface IAgendaItem {
    id: string | Schema.Types.ObjectId; //UUID
    topic: string;
    durationInMinutes: number //int
    agenda_id: string | Schema.Types.ObjectId;
    presenter_id: string | Schema.Types.ObjectId;
}