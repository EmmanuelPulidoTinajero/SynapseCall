export interface IAgendaItem {
    id: string; //UUID
    topic: string; 
    durationInMinutes: number //int
    //agenda_id: string UUID - Restricted, para implementación concreta
    //presented_id: string UUID - Restricted, para implementación concreta
}