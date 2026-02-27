"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryAuthentication = exports.authentication = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authentication = async (req, res, next) => {
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
        const verifiedToken = jsonwebtoken_1.default.verify(token, secret);
        if (verifiedToken) {
            req.user = verifiedToken;
            return next();
        }
    }
    catch (error) {
        if (req.accepts('json')) {
            return res.status(401).json({ message: "Invalid token" });
        }
        return res.redirect('/auth/login');
    }
};
exports.authentication = authentication;
const tryAuthentication = async (req, res, next) => {
    const token = req.cookies['accessToken'];
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!token) {
        req.user = null;
        return next();
    }
    try {
        const verifiedToken = jsonwebtoken_1.default.verify(token, secret);
        req.user = verifiedToken;
    }
    catch (error) {
        req.user = null;
    }
    next();
};
exports.tryAuthentication = tryAuthentication;
