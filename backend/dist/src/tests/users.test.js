"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("../app/routes"));
const database_1 = require("../database");
const users_model_1 = __importDefault(require("../app/users/users.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
jest.mock("../app/utils/email.service", () => ({
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
}));
describe('Usuarios', () => {
    const app = (0, express_1.default)();
    app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET || "test-secret"));
    app.use(express_1.default.json());
    app.use(routes_1.default);
    beforeAll(async () => {
        try {
            await (0, database_1.dbConnect)();
            console.log("Database Connected");
        }
        catch (error) {
            console.error("Database Connection Failed:", error);
            process.exit(1);
        }
    });
    afterAll(async () => {
        await users_model_1.default.deleteOne({ email: "mockuser@gmail.com" });
        await mongoose_1.default.connection.close();
    });
    test("CREANDO USUARIO", async () => {
        const randomId = Math.floor(Math.random() * 1000);
        const body = {
            email: `testsignup${randomId}@gmail.com`,
            password_hash: "password",
            name: "John Doe"
        };
        const res = await (0, supertest_1.default)(app).post("/auth/signup").send(body);
        if (res.status !== 201) {
            console.error("Signup Failed:", res.body);
        }
        await users_model_1.default.deleteOne({ email: body.email });
        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            message: "User Created. Please check your email to verify account."
        });
    });
    test("LOGGING IN", async () => {
        const email = "mockuser@gmail.com";
        const password = "password";
        const hashedPassword = await bcrypt_1.default.hash(password, 8);
        await users_model_1.default.deleteOne({ email });
        await users_model_1.default.create({
            name: "Login Tester",
            email: email,
            password_hash: hashedPassword,
            isVerified: true
        });
        const body = {
            email: email,
            password_hash: password,
        };
        const res = await (0, supertest_1.default)(app).post("/auth/login").send(body);
        if (res.status !== 200) {
            console.error("Login Failed:", res.status, res.body);
        }
        expect(res.status).toBe(200);
        expect(res.body.accessToken).toEqual(expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/));
    });
    test("CONTRASEÑA INCORRECTA", async () => {
        const email = "wrongpass_user@gmail.com";
        const truePassword = "correct-password";
        const hashedPassword = await bcrypt_1.default.hash(truePassword, 8);
        await users_model_1.default.deleteOne({ email });
        await users_model_1.default.create({
            name: "Test User",
            email: email,
            password_hash: hashedPassword,
            isVerified: true
        });
        const body = {
            email: email,
            password_hash: "wrong-password"
        };
        const res = await (0, supertest_1.default)(app).post("/auth/login").send(body);
        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: "Incorrect Password" });
        await users_model_1.default.deleteOne({ email });
    });
});
