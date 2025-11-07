import { Router, json } from "express";
import authRoutes from "./auth/auth.routes"
import meetingsRoutes from "./meetings/meetings.routes"
import usersRoutes from "./users/users.routes"

const router = Router();

router.use(json());
router.use("/auth", authRoutes);
router.use("/meetings", meetingsRoutes);
router.use("/users", usersRoutes);

export default router;