import { Schema } from "mongoose";

export interface IMessage {
    id: string | Schema.Types.ObjectId;
    timestamp: Date;
    sender_id: string | Schema.Types.ObjectId;
    meeting_id: string | Schema.Types.ObjectId;
    text: string;
}