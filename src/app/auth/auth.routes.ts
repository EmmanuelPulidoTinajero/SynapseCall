import { Router } from "express";
import { 
    login, 
    signup, 
    refreshToken, 
    verifyAccount, 
    forgotPassword, 
    resetPassword,
    renderResetPassword 
} from "./auth.controller";
import { authentication } from "../middlewares/authentication";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-account/:token", verifyAccount);
router.post("/refreshToken", refreshToken);

router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", renderResetPassword);
router.post("/reset-password/:token", resetPassword);

export default router;