"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User managment.
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user's unique identifier.
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         organizationId:
 *           type: string
 *     UpdateUser:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 */
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get personal user profile
 *     tags: [Users]
 *     description: Retrieves the authenticated user's profile information.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Personal user profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User not found
 */
router.get("/me", users_controller_1.getPersonalUser);
/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update personal user profile
 *     tags: [Users]
 *     description: Updates the authenticated user's profile information.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       '200':
 *         description: Personal user profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Bad Request - Invalid input.
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User not found
 */
router.patch("/me", users_controller_1.updatePersonalUser);
/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     description: Retrieves a specific user by their ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User not found
 */
router.get("/:userId", users_controller_1.getUserById);
/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     description: Deletes a specific user by their ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The ID of the user to delete.
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content - User deleted successfully.
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - User does not have permission to delete this user.
 *       '404':
 *         description: User not found
 */
router.delete("/:userId", users_controller_1.deleteUserById);
exports.default = router;
