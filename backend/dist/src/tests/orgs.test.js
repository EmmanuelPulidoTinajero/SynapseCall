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
const org_model_1 = __importDefault(require("../app/organizations/org.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
jest.mock("../app/utils/email.service", () => ({
    sendVerificationEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
}));
describe('Organizations', () => {
    const app = (0, express_1.default)();
    app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET || "test-secret"));
    app.use(express_1.default.json());
    app.use(routes_1.default);
    let accessToken = "";
    beforeAll(async () => {
        try {
            await (0, database_1.dbConnect)();
            console.log("Database Connected");
            const email = "org_tester@gmail.com";
            const password = "password123";
            const hashedPassword = await bcrypt_1.default.hash(password, 8);
            await users_model_1.default.deleteOne({ email });
            await users_model_1.default.create({
                name: "Org Tester",
                email: email,
                password_hash: hashedPassword,
                isVerified: true
            });
            const loginRes = await (0, supertest_1.default)(app).post("/auth/login").send({
                email: email,
                password_hash: password
            });
            accessToken = loginRes.body.accessToken;
        }
        catch (error) {
            console.error("Setup Failed:", error);
            process.exit(1);
        }
    });
    afterAll(async () => {
        await users_model_1.default.deleteOne({ email: "org_tester@gmail.com" });
        await org_model_1.default.deleteMany({ name: { $regex: /mockOrg/i } });
        await mongoose_1.default.connection.close();
    });
    test("CREANDO ORG", async () => {
        const randomId = Math.floor(Math.random() * 1000);
        const body = {
            name: `mockOrg_${randomId}`,
            domain: `www.mockorg${randomId}.com`,
            subscriptionTier: "free"
        };
        const res = await (0, supertest_1.default)(app)
            .post("/organizations/create")
            .set("Authorization", `Bearer ${accessToken}`)
            .send(body);
        if (res.status !== 201) {
            console.error("Org Creation Failed:", res.body);
        }
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("message", "New organization created");
        expect(res.body.organization).toHaveProperty("name", body.name);
        const dbOrg = await org_model_1.default.findOne({ domain: body.domain });
        expect(dbOrg).toBeTruthy();
    });
    test("ELIMINANDO ORG", async () => {
        const orgToDelete = await org_model_1.default.create({
            name: "Org To Delete",
            domain: "www.delete.com",
            subscriptionTier: "free"
        });
        const res = await (0, supertest_1.default)(app)
            .delete(`/organizations/${orgToDelete._id}`)
            .set("Authorization", `Bearer ${accessToken}`);
        if (res.status !== 200) {
            console.error("Delete Failed:", res.body);
        }
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: "Organization deleted." });
        const deletedOrg = await org_model_1.default.findById(orgToDelete._id);
        expect(deletedOrg).toBeNull();
    });
});
