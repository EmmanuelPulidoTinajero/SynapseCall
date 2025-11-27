import { Schema } from "mongoose";

export interface IMeetingSettings {
    id: string | Schema.Types.ObjectId;
    hasWaitingRoom: boolean;
    isWhitelistEnabled: boolean;
    whitelist: JSON;
    allowParticipantsToAddAgendaItems: boolean;
    accessCode: string;
    meeting_id: string | Schema.Types.ObjectId;
}