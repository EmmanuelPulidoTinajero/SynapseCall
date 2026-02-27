import { Types } from "mongoose";

export interface IMeetingSettings {
    id?: string;
    hasWaitingRoom: boolean;
    isWhitelistEnabled: boolean;
    whitelist: any;
    allowParticipantsToAddAgendaItems: boolean;
    accessCode: string;
    meeting_id: Types.ObjectId;
}