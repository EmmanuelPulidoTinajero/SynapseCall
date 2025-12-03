import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import User from '../users/users.model';
import bcrypt from "bcrypt";
import { IUser } from '../interfaces/user';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.service';

export const signup = async (req: Request, res: Response) => {
    try {
        const userInfo = req.body;
        const saltRounds = 8;

        if (!userInfo?.email || !userInfo?.password_hash || !userInfo?.name) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingUser = await User.findOne({ email: userInfo.email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const verificationToken = uuidv4();

        const newUser: IUser = {
            id: userInfo.id || undefined,
            name: userInfo.name,
            email: userInfo.email,
            password_hash: await bcrypt.hash(userInfo.password_hash, saltRounds),
            verificationToken: verificationToken,
            isVerified: false
        };

        await User.create(newUser);
        
        await sendVerificationEmail(newUser.email, verificationToken, newUser.name);

        return res.status(201).json({ message: "User Created. Please check your email to verify account." });
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

        if (!foundUser.isVerified) {
            return res.status(403).json({ message: "Account not verified. Please check your email." });
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

export const verifyAccount = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        return res.send("<h1>Cuenta verificada exitosamente! Ya puedes iniciar sesión.</h1>");
    } catch (error) {
        return res.status(500).send("<h1>Server error</h1>");
    }
}

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: "If account exists, email sent." });
        }

        const resetToken = uuidv4();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); 
        await user.save();

        await sendPasswordResetEmail(user.email, resetToken, user.name);

        return res.status(200).json({ message: "If account exists, email sent." });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

export const renderResetPassword = async (req: Request, res: Response) => {
    const { token } = req.params;
    res.render("reset-password", { token });
}

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send("<h1>Token inválido o expirado.</h1>");
        }

        user.password_hash = await bcrypt.hash(newPassword, 8);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.send("<h1>Contraseña actualizada exitosamente! Ya puedes iniciar sesión.</h1>");
    } catch (error) {
        return res.status(500).send("<h1>Error al actualizar contraseña.</h1>");
    }
}
export const renderLogin = (req: Request, res: Response) => {
    res.render('login');
};

export const renderSignup = (req: Request, res: Response) => {
    res.render('signup');
};

export const renderForgotPassword = (req: Request, res: Response) => {
    res.render('forgot-password');
};