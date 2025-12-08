import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
    },
    family: 4,
    logger: true,
    debug: true
} as any);

const compileTemplate = (templateName: string, data: any) => {
    const filePath = path.join(__dirname, '../../views/emails', `${templateName}.handlebars`);

    console.log("Looking for template at:", filePath);

    const source = fs.readFileSync(filePath, 'utf-8');
    const template = handlebars.compile(source);
    return template(data);
};

export const sendVerificationEmail = async (email: string, token: string, name: string) => {
    const url = `${process.env.FRONTEND_URL}/auth/verify-account/${token}`;
    const html = compileTemplate('verification', { name, url });

    await transporter.sendMail({
        from: '"Synapse Call Support" <no-reply@synapsecall.com>',
        to: email,
        subject: 'Verifica tu cuenta - Synapse Call',
        html: html,
    });
};

export const sendPasswordResetEmail = async (email: string, token: string, name: string) => {
    const url = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
    const html = compileTemplate('reset-password-email', { name, url });

    await transporter.sendMail({
        from: '"Synapse Call Support" <no-reply@synapsecall.com>',
        to: email,
        subject: 'Recuperar Contraseña - Synapse Call',
        html: html,
    });
};