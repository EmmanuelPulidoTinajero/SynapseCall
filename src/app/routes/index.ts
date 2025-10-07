import { Router } from "express";
import authRoutes from "../auth/auth.routes";
import meetingsRoutes from "../meetings/meetings.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/meetings", meetingsRoutes);

export default router;