export interface IOrganization {
    id: string;
    name: string;
    domain: string;
    subscriptionTier: "free" | "pro" | "enterprise";
}