import { Types } from "mongoose";

export interface IOrganization {
    id?: string;
    name: string;
    domain?: string;
    ownerId: Types.ObjectId;
    logoUrl?: string;
    members: Types.ObjectId[];
    subscription: {
        status: "active" | "inactive" | "past_due";
        plan: "organization_tier" | "free";
        expiresAt?: Date;
        paypalSubscriptionId?: string;
    };
}