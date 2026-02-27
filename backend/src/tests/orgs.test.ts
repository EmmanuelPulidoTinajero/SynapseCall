import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import router from "../app/routes";
import { dbConnect } from "../database";
import User from "../app/users/users.model";
import Organization from "../app/organizations/org.model";
import bcrypt from "bcrypt";

dotenv.config();

jest.mock("../app/utils/email.service", () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

describe('Organizations', () => {
  const app = express();

  app.use(cookieParser(process.env.COOKIE_SECRET || "test-secret"));
  app.use(express.json());
  app.use(router);

  let accessToken = "";

  beforeAll(async () => {
    try {
      await dbConnect();
      console.log("Database Connected");

      const email = "org_tester@gmail.com";
      const password = "password123";
      const hashedPassword = await bcrypt.hash(password, 8);

      await User.deleteOne({ email });

      await User.create({
        name: "Org Tester",
        email: email,
        password_hash: hashedPassword,
        isVerified: true
      });

      const loginRes = await request(app).post("/auth/login").send({
        email: email,
        password_hash: password
      });

      accessToken = loginRes.body.accessToken;

    } catch (error) {
      console.error("Setup Failed:", error);
      process.exit(1);
    }
  });

  afterAll(async () => {
    await User.deleteOne({ email: "org_tester@gmail.com" });
    await Organization.deleteMany({ name: { $regex: /mockOrg/i } });
    await mongoose.connection.close();
  });

  test("CREANDO ORG", async () => {
    const randomId = Math.floor(Math.random() * 1000);
    const body = {
      name: `mockOrg_${randomId}`,
      domain: `www.mockorg${randomId}.com`,
      subscriptionTier: "free"
    };

    const res = await request(app)
      .post("/organizations/create")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(body);

    if (res.status !== 201) {
      console.error("Org Creation Failed:", res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "New organization created");
    expect(res.body.organization).toHaveProperty("name", body.name);

    const dbOrg = await Organization.findOne({ domain: body.domain });
    expect(dbOrg).toBeTruthy();
  });

  test("ELIMINANDO ORG", async () => {
    const orgToDelete = await Organization.create({
      name: "Org To Delete",
      domain: "www.delete.com",
      subscriptionTier: "free"
    });

    const res = await request(app)
      .delete(`/organizations/${orgToDelete._id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    if (res.status !== 200) {
        console.error("Delete Failed:", res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Organization deleted." });

    const deletedOrg = await Organization.findById(orgToDelete._id);
    expect(deletedOrg).toBeNull();
  });
});