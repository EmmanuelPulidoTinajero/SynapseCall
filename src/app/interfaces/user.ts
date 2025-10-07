export interface IUser {
    id: string; //String para UUID
    name: string;
    email: string;
    password_hash: string;
    // organization_id: string; - Restricted, para implementación concreta
}