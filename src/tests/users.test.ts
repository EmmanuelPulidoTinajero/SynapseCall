import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import router from "../app/routes";
import { dbConnect } from "../database";
import User from "../app/users/users.model";
import bcrypt from "bcrypt";

dotenv.config();

jest.mock("../app/utils/email.service", () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

describe('Usuarios', () => {
  const app = express();

  app.use(cookieParser(process.env.COOKIE_SECRET || "test-secret"));

  app.use(express.json());
  app.use(router);

  beforeAll(async () => {
    try {
      await dbConnect();
      console.log("Database Connected");
    } catch (error) {
      console.error("Database Connection Failed:", error);
      process.exit(1);
    }
  });

  afterAll(async () => {
    await User.deleteOne({ email: "mockuser@gmail.com" });
    await mongoose.connection.close();
  });

  test("CREANDO USUARIO", async () => {
    const randomId = Math.floor(Math.random() * 1000);
    const body = {
      email: `testsignup${randomId}@gmail.com`,
      password_hash: "password",
      name: "John Doe"
    };

    const res = await request(app).post("/auth/signup").send(body);

    if (res.status !== 201) {
      console.error("Signup Failed:", res.body);
    }

    await User.deleteOne({ email: body.email });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: "User Created. Please check your email to verify account."
    });
  });

  test("LOGGING IN", async () => {
    const email = "mockuser@gmail.com";
    const password = "password";
    const hashedPassword = await bcrypt.hash(password, 8);

    await User.deleteOne({ email });

    await User.create({
        name: "Login Tester",
        email: email,
        password_hash: hashedPassword,
        isVerified: true
    });

    const body = {
      email: email,
      password_hash: password,
    };

    const res = await request(app).post("/auth/login").send(body);

    if (res.status !== 200) {
      console.error("Login Failed:", res.status, res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(
      expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
    );
  });

  test("CONTRASEÑA INCORRECTA", async () => {
    const email = "wrongpass_user@gmail.com";
    const truePassword = "correct-password";
    const hashedPassword = await bcrypt.hash(truePassword, 8);

    await User.deleteOne({ email });
    await User.create({
        name: "Test User",
        email: email,
        password_hash: hashedPassword,
        isVerified: true
    });

    const body = {
      email: email,
      password_hash: "wrong-password"
    };

    const res = await request(app).post("/auth/login").send(body);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "Incorrect Password" });

    await User.deleteOne({ email });
  });
});