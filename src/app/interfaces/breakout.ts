import { Schema } from "mongoose";

export interface IBreakoutRoom {
    id: string | Schema.Types.ObjectId;
    title: string;
    meeting_id: string | Schema.Types.ObjectId;
}