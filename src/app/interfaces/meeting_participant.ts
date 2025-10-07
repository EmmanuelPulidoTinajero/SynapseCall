export interface IMeetingParticipant {
    role: "host" | "cohost" | "moderator" | "member" | "guest";
    joinedAt: Date;
    leftAt: Date;
    //meeting_id: string UUID; - Restricted, para implementación concreta
    //user_id: string UUID; - Restricted, para implementación concreta
}