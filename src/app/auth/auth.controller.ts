import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import User from '../users/users.model';
import bcrypt from "bcrypt";
import { IUser } from '../interfaces/user';

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

        await User.create(newUser);

        return res.status(201).json({ message: "User Created" });
    } catch (error) {
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

        const accessToken = jwt.sign(
            { id: foundUser.id, email: foundUser.email, name: foundUser.name },
            process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { id: foundUser.id },
            process.env.REFRESH_TOKEN_SECRET as jwt.Secret,
            { expiresIn: '7d' }
        );

        await User.updateOne({ _id: foundUser.id }, { $push: { refresh_tokens: refreshToken } });

        res.cookie('refresh', refreshToken, {
            httpOnly: true,
            signed: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful",
            accessToken
        });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const cookies = req.signedCookies;
    if (!cookies?.refresh) return res.status(401).json({ message: "No refresh token cookie" });

    const refreshToken = cookies.refresh;
    res.clearCookie('refresh', { httpOnly: true, signed: true });

    const foundUser = await User.findOne({ refresh_tokens: refreshToken }).exec();

    if (!foundUser) {
        return res.sendStatus(403);
    }

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
        async (err: any, decoded: any) => {
            if (err) {
                foundUser.refresh_tokens = (foundUser.refresh_tokens || []).filter(rt => rt !== refreshToken);
                await foundUser.save();
                return res.sendStatus(403);
            }

            const newAccessToken = jwt.sign(
                { id: foundUser.id, email: foundUser.email, name: foundUser.name },
                process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
                { expiresIn: '15m' }
            );

            const newRefreshToken = jwt.sign(
                { id: foundUser.id },
                process.env.REFRESH_TOKEN_SECRET as jwt.Secret,
                { expiresIn: '7d' }
            );

            foundUser.refresh_tokens = (foundUser.refresh_tokens || []).filter(rt => rt !== refreshToken);
            foundUser.refresh_tokens.push(newRefreshToken);
            await foundUser.save();

            res.cookie('refresh', newRefreshToken, {
                httpOnly: true,
                signed: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({ accessToken: newAccessToken });
        }
    );
};

export const logout = async (req: Request, res: Response) => {
    const cookies = req.signedCookies;
    if (!cookies?.refresh) return res.sendStatus(204);

    const refreshToken = cookies.refresh;
    const foundUser = await User.findOne({ refresh_tokens: refreshToken }).exec();

    if (foundUser) {
        foundUser.refresh_tokens = (foundUser.refresh_tokens || []).filter(rt => rt !== refreshToken);
        await foundUser.save();
    }

    res.clearCookie('refresh', { httpOnly: true, signed: true });
    return res.sendStatus(204);
}

export const verifyAccount = (req: Request, res: Response) => {
    return res.status(501).json({ message: "Not implemented" });
}