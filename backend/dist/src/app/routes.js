"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth/auth.routes"));
const meetings_routes_1 = __importDefault(require("./meetings/meetings.routes"));
const users_routes_1 = __importDefault(require("./users/users.routes"));
const org_routes_1 = __importDefault(require("./organizations/org.routes"));
const router = (0, express_1.Router)();
router.use((0, express_1.json)());
router.use("/auth", auth_routes_1.default);
router.use("/users", users_routes_1.default);
router.use("/meetings", meetings_routes_1.default);
router.use("/organizations", org_routes_1.default);
exports.default = router;
