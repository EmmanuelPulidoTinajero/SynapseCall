export interface IMeetingSettings {
    id: string;
    hasWaitingRoom: boolean;
    isWhitelistEnabled: boolean;
    whitelist: JSON;
    allowParticipantsToAddAgendaItems: boolean;
    accessCode: string;
    //meeting_id: string UUID; - Restricted, para implementación concreta
}