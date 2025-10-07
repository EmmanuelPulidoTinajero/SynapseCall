export interface IMeeting {
    id: string;
    title: string;
    description: string;
    status: "scheduled" | "ongoing" | "ended";
    startTime: Date;
    endTime: Date;
    //initiator_id: string; - Restricted, para implementación concreta
}