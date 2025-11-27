import { Schema } from "mongoose";

export interface IAgenda {
    id: string | Schema.Types.ObjectId; //UUID
    currentItemIndex: number; //int
    isAutoAdvanceEnabled: boolean;
    meeting_id: string | Schema.Types.ObjectId;
}