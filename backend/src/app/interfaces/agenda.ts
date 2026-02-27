import { Types } from "mongoose";

export interface IAgenda {
    id?: string;
    currentItemIndex: number;
    isAutoAdvanceEnabled: boolean;
    meeting_id: Types.ObjectId; 
}