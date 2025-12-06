import { Types } from "mongoose";

export interface IUser {
    id?: string;
    name: string;
    email: string;
    password_hash: string;
    refresh_tokens?: string[];
    isVerified?: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    organizationId?: Types.ObjectId;
    personalSubscription: {
        status: "active" | "inactive" | "past_due";
        plan: "individual_pro" | "free";
        expiresAt?: Date;
        paypalSubscriptionId?: string;
    };
}