import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { IUser } from '../interfaces/user';
import User from '../users/users.model';
import bcrypt from "bcrypt";

export const signup = async (req: Request, res: Response) => {
    try {
        const userInfo = req.body;
        const saltRounds = 8;

        if (!userInfo?.email || !userInfo?.password_hash || !userInfo?.name) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newUser: IUser = {
            id: userInfo.id || undefined,
            name: userInfo.name,
            email: userInfo.email,
            password_hash: await bcrypt.hash(userInfo.password_hash, saltRounds)
        };

        const created = await User.create(newUser);

        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) {
            return res.status(500).json({ message: "Server misconfiguration: missing ACCESS_TOKEN_SECRET" });
        }

        const token = jwt.sign({ id: created.id, email: created.email, name: created.name }, secret as jwt.Secret, { expiresIn: '1h' });

        return res.status(201).json({ message: "User Created", token });
    } catch (error) {
        console.error('signup error:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password_hash } = req.body || {};
        if (!email || !password_hash) {
            return res.status(400).json({ message: "Missing credentials" });
        }

        const foundUser = await User.findOne({ email }).lean();
        if (!foundUser) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const match = await bcrypt.compare(password_hash, (foundUser as any).password_hash);
        if (!match) {
            return res.status(401).json({ message: "Incorrect Password" });
        }

        const secret = process.env.ACCESS_TOKEN_SECRET;
        if (!secret) {
            return res.status(500).json({ message: "Server misconfiguration: missing ACCESS_TOKEN_SECRET" });
        }

        const token = jwt.sign({ id: foundUser.id, email: foundUser.email, name: foundUser.name }, secret as jwt.Secret, { expiresIn: '1h' });
        return res.status(200).json({ message: "User Confirmed", token });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

export const refreshToken = (req: Request, res: Response) => {
    return res.status(501).json({ message: "falta implementar" });
};

export const verifyAccount = (req: Request, res: Response) => {
    return res.status(501).json({ message: "falta implementar" });
}