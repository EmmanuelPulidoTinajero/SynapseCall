import { Router } from "express";
import {
    getPersonalUser,
    updatePersonalUser,
    getUserById,
    deleteUserById
} from "./users.controller"

const router = Router();

router.get("/me", getPersonalUser);
router.patch("/me", updatePersonalUser);
router.get("/:userId", getUserById);
router.get("/:userId", deleteUserById);

export default router;