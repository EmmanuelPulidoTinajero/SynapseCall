import { Router } from "express";
import {
    getOrgById,
    createNewOrg,
    updateOrgById,
    deleteOrgById
} from "./org.controller"

const router = Router();

router.get("/:orgId", getOrgById);
router.post("/create", createNewOrg);
router.patch("/:orgId", updateOrgById);
router.delete("/:orgId", deleteOrgById);

export default router;