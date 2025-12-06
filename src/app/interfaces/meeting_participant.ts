import { Types } from "mongoose";

export interface IMeetingParticipant {
    role: "host" | "cohost" | "moderator" | "member" | "guest";
    joinedAt: Date;
    leftAt?: Date;
    displayName: string;
    isMutedByHost: boolean;
    meeting_id: Types.ObjectId;
    user_id: Types.ObjectId;
}