
import { Router } from "express";
import {
    getPersonalUser,
    updatePersonalUser,
    getUserById,
    deleteUserById
} from "./users.controller"

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for managing users
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get personal user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Personal user profile
 *       404:
 *         description: User not found
 */
router.get("/me", getPersonalUser);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update personal user profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Personal user profile updated
 *       404:
 *         description: User not found
 */
router.patch("/me", updatePersonalUser);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 */
router.get("/:userId", getUserById);

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete("/:userId", deleteUserById);

export default router;
