import { Request, Response, NextFunction } from "express";

export const dummyAuth = (req: Request, res: Response, next: NextFunction) => {
    console.log("Authentication middleware");
    next();
};