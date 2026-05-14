import { Router, RequestHandler } from "express";
import { getOrgById, getMyOrg, createNewOrg, updateOrgById, deleteOrgById, addMemberToOrg, joinOrg, leaveOrg } from "./org.controller"
import { authentication } from "../middlewares/authentication";
import upload from "../middlewares/upload";

const router = Router();

router.get("/mine", authentication, getMyOrg as RequestHandler);
router.get("/:orgId", authentication, getOrgById);
router.post("/create", authentication, upload.single("file"), createNewOrg as RequestHandler);
router.patch("/:orgId", authentication, updateOrgById as RequestHandler);
router.delete("/:orgId", authentication, deleteOrgById as RequestHandler);
router.post("/:orgId/members", authentication, addMemberToOrg as RequestHandler);
router.post("/:orgId/join", authentication, joinOrg as RequestHandler);
router.post("/:orgId/leave", authentication, leaveOrg as RequestHandler);

export default router;