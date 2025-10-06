import { Router } from "express";
import { login, signup, refresh-token } from "./auth.controller"

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-toker", refresh-token);