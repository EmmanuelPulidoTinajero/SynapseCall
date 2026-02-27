"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserById = exports.getUserById = exports.updatePersonalUser = exports.getPersonalUser = void 0;
const users_model_1 = __importDefault(require("./users.model"));
const mongoose_1 = require("mongoose");
const getPersonalUser = async (req, res) => {
    try {
        const userId = req.user?.id; //sino sale error
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const me = await users_model_1.default.findById(userId).select("-password_hash"); //-password_hash para no dar la contraseña
        if (!me) {
            return res.status(404).json({ message: "User no found" });
        }
        res.status(200).json(me);
    }
    catch (error) {
        res.status(500).json({ message: "Error getting personal users" });
    }
    //res.status(200).json({ message: "Getting personal profile." });
};
exports.getPersonalUser = getPersonalUser;
const updatePersonalUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const updates = req.body;
        const updated = await users_model_1.default.findByIdAndUpdate(userId, updates, { new: true }).select("-password_hash");
        if (!updated) {
            return res.status(404).json({ message: "User no found" });
        }
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ message: "Error updating user" });
    }
    //res.status(200).json({ message: "Updating personal profile." });
};
exports.updatePersonalUser = updatePersonalUser;
const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        const user = await users_model_1.default.findById(userId).select("-password_hash");
        if (!user) {
            return res.status(404).json({ message: "User no found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Error getting user by ID" });
    }
    //res.status(200).json({ message: "Getting user by ID." });
};
exports.getUserById = getUserById;
const deleteUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }
        const deleted = await users_model_1.default.findByIdAndDelete(userId);
        if (!deleted) {
            return res.status(404).json({ message: "User no found" });
        }
        res.status(204).json({ message: "User deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
    //res.status(200).json({ message: "Deleting user by ID." });
};
exports.deleteUserById = deleteUserById;
