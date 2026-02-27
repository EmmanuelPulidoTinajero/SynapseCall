import { Types } from "mongoose";

export interface IBreakoutRoom {
    id?: string;
    roomName: string;
    meeting_id: Types.ObjectId;
}