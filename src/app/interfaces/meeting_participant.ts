import { Schema } from "mongoose";

export interface IMeetingParticipant {
    role: "host" | "cohost" | "moderator" | "member" | "guest";
    joinedAt: Date;
    leftAt: Date;
    meeting_id: string | Schema.Types.ObjectId;
    user_id: string | Schema.Types.ObjectId;
}