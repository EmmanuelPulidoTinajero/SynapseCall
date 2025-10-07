import { Router } from "express";
import { login, signup, refreshToken } from "./auth.controller"

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refreshToken", refreshToken);

export default router;