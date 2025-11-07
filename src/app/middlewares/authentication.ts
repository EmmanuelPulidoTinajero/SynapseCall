import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authentication = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!token) {
        return res.status(401).json({ message: "Token not sent" });
    }

    try {
        const verifiedToken = jwt.verify(token, secret as jwt.Secret);
        if (verifiedToken) {
            return next();
        }
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Invalid token" });
    }
};