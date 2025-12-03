export interface IUser {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    refresh_tokens?: string[];
    isVerified?: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    // organization_id: string;
}