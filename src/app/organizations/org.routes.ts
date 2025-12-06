import { Router } from "express";
import { getOrgById, createNewOrg, updateOrgById, deleteOrgById, addMemberToOrg } from "./org.controller"
import { authentication } from "../middlewares/authentication";
import upload from "../middlewares/upload";

const router = Router();

router.get("/:orgId", authentication, getOrgById);
router.post("/create", authentication, upload.single("file"), createNewOrg);
router.patch("/:orgId", authentication, updateOrgById);
router.delete("/:orgId", authentication, deleteOrgById);
router.post("/:orgId/members", authentication, addMemberToOrg);

export default router;