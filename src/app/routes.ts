import { Router, json } from "express";
import authRoutes from "./auth/auth.routes"
import meetingsRoutes from "./meetings/meetings.routes"
import usersRoutes from "./users/users.routes"
import OrganizationRoutes from "./organizations/org.routes"
const router = Router();

router.use(json());
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/meetings", meetingsRoutes);
router.use("/organizations", OrganizationRoutes);

router.get("/", (req, res) => {
    res.render("home");
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

export default router;