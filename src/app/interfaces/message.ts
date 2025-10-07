export interface IMessage {
    id: string;
    timestamp: Date;
    //sender_id: string UUID; - Restricted, para implementación concreta
    //meeting_id: string UUID: - Restricted, para implementación concreta
}