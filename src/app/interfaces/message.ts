import { Types } from "mongoose";

export interface IMessage {
    id?: string;
    text: string;
    timestamp: Date;
    sender_id: Types.ObjectId;
    meeting_id: Types.ObjectId;
}