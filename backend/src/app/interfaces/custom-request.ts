import { Request } from 'express';

export interface AuthRequest extends Request {
    user?: {
        id: string;
    };
    file?: Express.Multer.File | any;
}