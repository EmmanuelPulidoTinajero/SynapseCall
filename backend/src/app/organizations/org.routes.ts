import { Router, RequestHandler } from "express";
import { getOrgById, createNewOrg, updateOrgById, deleteOrgById, addMemberToOrg } from "./org.controller"
import { authentication } from "../middlewares/authentication";
import upload from "../middlewares/upload";

const router = Router();

router.get("/:orgId", authentication, getOrgById);
router.post("/create", authentication, upload.single("file"), createNewOrg as RequestHandler);
router.patch("/:orgId", authentication, updateOrgById as RequestHandler);
router.delete("/:orgId", authentication, deleteOrgById as RequestHandler);
router.post("/:orgId/members", authentication, addMemberToOrg as RequestHandler);

export default router;