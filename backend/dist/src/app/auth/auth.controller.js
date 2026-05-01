"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderLandingOrHome = exports.renderForgotPassword = exports.renderSignup = exports.renderLogin = exports.resetPassword = exports.renderResetPassword = exports.forgotPassword = exports.verifyAccount = exports.logout = exports.refreshToken = exports.login = exports.signup = exports.googleLogin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_model_1 = __importDefault(require("../users/users.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const email_service_1 = require("../utils/email.service");
const google_auth_library_1 = require("google-auth-library");
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleOAuthClient = googleClientId ? new google_auth_library_1.OAuth2Client(googleClientId) : null;
const getGoogleIdentity = async (body) => {
    if (body.credential) {
        if (!googleOAuthClient || !googleClientId) {
            throw new Error("GOOGLE_CLIENT_ID is required to verify Google logins");
        }
        const ticket = await googleOAuthClient.verifyIdToken({
            idToken: body.credential,
            audience: googleClientId,
        });
        const payload = ticket.getPayload();
        if (!payload?.email || !payload.sub) {
            throw new Error("Google token payload is incomplete");
        }
        return {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
        };
    }
    if (body.googleId && body.email) {
        return {
            googleId: body.googleId,
            email: body.email,
            name: body.name || body.email.split('@')[0],
        };
    }
    throw new Error("Google credential is required");
};
const googleLogin = async (req, res) => {
    try {
        const { googleId, email, name } = await getGoogleIdentity(req.body || {});
        if (!googleId || !email) {
            return res.status(400).json({ message: "googleId and email are required" });
        }
        let user = await users_model_1.default.findOne({ googleId }).lean();
        if (!user) {
            user = await users_model_1.default.findOne({ email }).lean();
            if (user) {
                await users_model_1.default.updateOne({ _id: user._id }, { googleId });
            }
            else {
                const newUser = await users_model_1.default.create({
                    googleId,
                    email,
                    name: name || email.split('@')[0],
                    isVerified: true,
                    personalSubscription: {
                        status: 'inactive',
                        plan: 'free'
                    }
                });
                user = newUser.toObject();
            }
        }
        const userId = user._id.toString();
        const accessToken = jsonwebtoken_1.default.sign({ id: userId, email: user.email, name: user.name }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        await users_model_1.default.updateOne({ _id: user._id }, { $push: { refresh_tokens: refreshToken } });
        res.cookie('refresh', refreshToken, {
            httpOnly: true,
            signed: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000
        });
        return res.status(200).json({
            message: "Google login successful",
            accessToken,
            user: { id: userId, email: user.email, name: user.name }
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Server error during Google login";
        if (message === "Google credential is required") {
            return res.status(400).json({ message });
        }
        if (message === "Google token payload is incomplete") {
            return res.status(401).json({ message: "Invalid Google credential" });
        }
        if (message.includes("GOOGLE_CLIENT_ID")) {
            return res.status(500).json({ message });
        }
        if (message.includes("Wrong number of parts") || message.includes("invalid") || message.includes("verify")) {
            return res.status(401).json({ message: "Invalid Google credential" });
        }
        console.error("Google login error:", error);
        return res.status(500).json({ message: "Server error during Google login" });
    }
};
exports.googleLogin = googleLogin;
const signup = async (req, res) => {
    try {
        const userInfo = req.body;
        const saltRounds = 8;
        if (!userInfo?.email || !userInfo?.password_hash || !userInfo?.name) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const existingUser = await users_model_1.default.findOne({ email: userInfo.email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        // const verificationToken = uuidv4();
        const newUser = {
            id: userInfo.id || undefined,
            name: userInfo.name,
            email: userInfo.email,
            password_hash: await bcrypt_1.default.hash(userInfo.password_hash, saltRounds),
            // verificationToken: verificationToken,
            isVerified: true,
            personalSubscription: {
                status: 'inactive',
                plan: 'free'
            }
        };
        await users_model_1.default.create(newUser);
        try {
            // await sendVerificationEmail(newUser.email, verificationToken, newUser.name);
        }
        catch (emailError) {
            console.error("Verification email failed to send:", emailError);
            await users_model_1.default.deleteOne({ email: newUser.email });
            return res.status(500).json({ message: "Error sending verification email. Please check your credentials and try again." });
        }
        return res.status(201).json({ message: "User Created. Please check your email to verify account." });
    }
    catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password_hash } = req.body || {};
        if (!email || !password_hash) {
            return res.status(400).json({ message: "Missing credentials" });
        }
        const foundUser = await users_model_1.default.findOne({ email });
        if (!foundUser) {
            return res.status(404).json({ message: "User Not Found" });
        }
        if (!foundUser.isVerified) {
            return res.status(403).json({ message: "Account not verified. Please check your email." });
        }
        if (!foundUser.password_hash) {
            return res.status(400).json({ message: "This account uses Google Sign-In. Please login with Google." });
        }
        const match = await bcrypt_1.default.compare(password_hash, foundUser.password_hash);
        if (!match) {
            return res.status(401).json({ message: "Incorrect Password" });
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: foundUser.id, email: foundUser.email, name: foundUser.name }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: foundUser.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        await users_model_1.default.updateOne({ _id: foundUser.id }, { $push: { refresh_tokens: refreshToken } });
        res.cookie('refresh', refreshToken, {
            httpOnly: true,
            signed: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000 // 15 minutos
        });
        return res.status(200).json({
            message: "Login successful",
            accessToken
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    const cookies = req.signedCookies;
    if (!cookies?.refresh)
        return res.status(401).json({ message: "No refresh token cookie" });
    const refreshToken = cookies.refresh;
    res.clearCookie('refresh', { httpOnly: true, signed: true });
    const foundUser = await users_model_1.default.findOne({ refresh_tokens: refreshToken }).exec();
    if (!foundUser) {
        return res.sendStatus(403);
    }
    jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            foundUser.refresh_tokens = (foundUser.refresh_tokens || []).filter(rt => rt !== refreshToken);
            await foundUser.save();
            return res.sendStatus(403);
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ id: foundUser.id, email: foundUser.email, name: foundUser.name }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: foundUser.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        foundUser.refresh_tokens = (foundUser.refresh_tokens || []).filter(rt => rt !== refreshToken);
        foundUser.refresh_tokens.push(newRefreshToken);
        await foundUser.save();
        res.cookie('refresh', newRefreshToken, {
            httpOnly: true,
            signed: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({ accessToken: newAccessToken });
    });
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    const cookies = req.signedCookies;
    if (!cookies?.refresh)
        return res.sendStatus(204);
    const refreshToken = cookies.refresh;
    const foundUser = await users_model_1.default.findOne({ refresh_tokens: refreshToken }).exec();
    if (foundUser) {
        foundUser.refresh_tokens = (foundUser.refresh_tokens || []).filter(rt => rt !== refreshToken);
        await foundUser.save();
    }
    res.clearCookie('refresh', { httpOnly: true, signed: true });
    res.clearCookie('accessToken', { httpOnly: true });
    return res.status(200).json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const verifyAccount = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token)
            return res.status(400).json({ message: "Token is required" });
        const user = await users_model_1.default.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ message: "El enlace es inválido o ha expirado." });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        return res.status(200).json({
            message: "¡Cuenta verificada exitosamente! Ya puedes iniciar sesión."
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Error interno del servidor." });
    }
};
exports.verifyAccount = verifyAccount;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await users_model_1.default.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: "If account exists, email sent." });
        }
        const resetToken = (0, uuid_1.v4)();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000);
        await user.save();
        await (0, email_service_1.sendPasswordResetEmail)(user.email, resetToken, user.name);
        return res.status(200).json({ message: "If account exists, email sent." });
    }
    catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};
exports.forgotPassword = forgotPassword;
const renderResetPassword = async (req, res) => {
    const { token } = req.params;
    res.render("reset-password", { token });
};
exports.renderResetPassword = renderResetPassword;
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        const user = await users_model_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).send("<h1>Token inválido o expirado.</h1>");
        }
        user.password_hash = await bcrypt_1.default.hash(newPassword, 8);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return res.send("<h1>Contraseña actualizada exitosamente! Ya puedes iniciar sesión.</h1>");
    }
    catch (error) {
        return res.status(500).send("<h1>Error al actualizar contraseña.</h1>");
    }
};
exports.resetPassword = resetPassword;
const renderLogin = (req, res) => {
    res.render('login', {
        layout: 'main',
        googleClientId: process.env.GOOGLE_CLIENT_ID
    });
};
exports.renderLogin = renderLogin;
const renderSignup = (req, res) => {
    res.render('signup', {
        layout: 'main',
        googleClientId: process.env.GOOGLE_CLIENT_ID
    });
};
exports.renderSignup = renderSignup;
const renderForgotPassword = (req, res) => {
    res.render('forgot-password');
};
exports.renderForgotPassword = renderForgotPassword;
const renderLandingOrHome = async (req, res) => {
    const userPayload = req.user;
    if (!userPayload) {
        return res.render('landing', {
            layout: 'main',
            title: 'Bienvenido a Synapse Call'
        });
    }
    try {
        const user = await users_model_1.default.findById(userPayload.id).populate('organizationId').exec();
        if (!user) {
            return res.clearCookie('accessToken').clearCookie('refresh').redirect('/');
        }
        const organization = user.organizationId;
        const viewData = {
            user: {
                name: user.name,
                email: user.email,
                isPro: user.personalSubscription.status === 'active' || (organization?.subscription?.status === 'active')
            },
            organization: organization ? {
                id: organization._id?.toString() || organization.id,
                name: organization.name,
                logoUrl: organization.logoUrl,
                isOwner: organization.ownerId.toString() === user.id
            } : null
        };
        return res.render('home', {
            layout: 'main',
            ...viewData,
            paypalClientId: process.env.PAYPAL_CLIENT_ID
        });
    }
    catch (error) {
        console.error("Error rendering home:", error);
        return res.render('landing');
    }
};
exports.renderLandingOrHome = renderLandingOrHome;
