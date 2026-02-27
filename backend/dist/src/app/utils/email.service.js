"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const compileTemplate = (templateName, data) => {
    const filePath = path_1.default.join(process.cwd(), 'src', 'views', 'emails', `${templateName}.handlebars`);
    const source = fs_1.default.readFileSync(filePath, 'utf-8');
    const template = handlebars_1.default.compile(source);
    return template(data);
};
const sendVerificationEmail = async (email, token, name) => {
    const url = `${process.env.FRONTEND_URL}/auth/verify-account/${token}`;
    const html = compileTemplate('verification', { name, url });
    await transporter.sendMail({
        from: '"Synapse Call Support" <no-reply@synapsecall.com>',
        to: email,
        subject: 'Verifica tu cuenta - Synapse Call',
        html: html,
    });
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (email, token, name) => {
    const url = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
    const html = compileTemplate('reset-password-email', { name, url });
    await transporter.sendMail({
        from: '"Synapse Call Support" <no-reply@synapsecall.com>',
        to: email,
        subject: 'Recuperar Contraseña - Synapse Call',
        html: html,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
