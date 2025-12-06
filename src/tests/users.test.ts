import request from "supertest";
import express from "express";
import router from "../app/routes";

describe('Usuarios', () => {
  const app = express();
  app.use(express.json());
  app.use(router);

  test("CREANDO USUARIO", async () => {
    const body = {
      email: "mockuser@gmail.com",
      password_hash: "password",
      name: "John Doe"
    };

    const res = await request(app).post("/auth/signup").send(body);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "User Created. Please check your email to verify account." });
  });

  test("LOGGING IN", async () => {
    const body = {
      email: "mockuser@gmail.com",
      password_hash: "password",
    };

    const res = await request(app).post("/auth/login").send(body);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });
});
