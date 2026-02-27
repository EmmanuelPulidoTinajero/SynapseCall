import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authentication = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"] || req.cookies['accessToken'];
    const token = authHeader && (authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader);
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!token) {
        if (req.accepts('json')) {
             return res.status(401).json({ message: "Token required" });
        }
        return res.redirect('/auth/login');
    }

    try {
        const verifiedToken = jwt.verify(token, secret as jwt.Secret);
        if (verifiedToken) {
            (req as any).user = verifiedToken;
            return next();
        }
    } catch (error) {
        if (req.accepts('json')) {
            return res.status(401).json({ message: "Invalid token" });
        }
        return res.redirect('/auth/login');
    }
};

export const tryAuthentication = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies['accessToken'];
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!token) {
        (req as any).user = null;
        return next();
    }

    try {
        const verifiedToken = jwt.verify(token, secret as jwt.Secret);
        (req as any).user = verifiedToken;
    } catch (error) {
        (req as any).user = null;
    }
    next();
};