"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const org_controller_1 = require("./org.controller");
const authentication_1 = require("../middlewares/authentication");
const upload_1 = __importDefault(require("../middlewares/upload"));
const router = (0, express_1.Router)();
router.get("/:orgId", authentication_1.authentication, org_controller_1.getOrgById);
router.post("/create", authentication_1.authentication, upload_1.default.single("file"), org_controller_1.createNewOrg);
router.patch("/:orgId", authentication_1.authentication, org_controller_1.updateOrgById);
router.delete("/:orgId", authentication_1.authentication, org_controller_1.deleteOrgById);
router.post("/:orgId/members", authentication_1.authentication, org_controller_1.addMemberToOrg);
exports.default = router;
