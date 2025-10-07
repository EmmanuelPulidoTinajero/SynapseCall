export interface IAgenda {
    id: string; //UUID
    currentItemIndex: number; //int
    isAutoAdvanceEnabled: boolean;
    //meeting_id: string UUID; - Restricted, para implementación concreta
}