export interface IUser {
    id: string; //String para UUID
    name: string;
    email: string;
    password_hash: string;
    refresh_tokens?: string[];
    // organization_id: string; - Restricted, para implementación concreta
}