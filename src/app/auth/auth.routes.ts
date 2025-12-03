import { Router } from "express";
import { 
    login, 
    signup, 
    refreshToken, 
    verifyAccount, 
    forgotPassword, 
    resetPassword,
    renderResetPassword,
    renderLogin,
    renderSignup,
    renderForgotPassword
} from "./auth.controller";
import { authentication } from "../middlewares/authentication";

const router = Router();

router.get("/login", renderLogin);
router.post("/login", login);

router.get("/signup", renderSignup);
router.post("/signup", signup);

router.get("/forgot-password", renderForgotPassword);
router.post("/forgot-password", forgotPassword);

router.get("/verify-account/:token", verifyAccount);
router.post("/refreshToken", refreshToken);

router.get("/reset-password/:token", renderResetPassword);
router.post("/reset-password/:token", resetPassword);

export default router;