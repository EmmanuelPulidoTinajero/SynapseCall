import { Request, Response } from 'express';

export const signup = (req: Request, res: Response) => {
    res.status(200).json({ message: "User signed" });
};

export const login = (eq: Request, res: Response) => {
    res.status(200).json({ message: "User logged" });
};

export const refreshToken = (req: Request, res: Response) => {
    res.status(200).json({ message: "Token refreshed" });
}