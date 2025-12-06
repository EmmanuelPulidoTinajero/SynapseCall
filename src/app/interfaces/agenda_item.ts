export interface IAgendaItem {
    id?: string;
    topic: string;
    durationInMinutes: number;
    order: number;
    status: "pending" | "active" | "completed";
    actualStartTime?: Date;
    agenda_id?: string;
    presenter_id?: string;
}