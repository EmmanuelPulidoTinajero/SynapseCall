import { Router } from "express";
import { login, signup, refreshToken, verifyAccount } from "./auth.controller";
import { authentication } from "../middlewares/authentication";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and registration managment.
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
 *     AuthTokens:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Creates a new user account and associated organization.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - organizationName
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               organizationName:
 *                 type: string
 *     responses:
 *       '201':
 *         description: User created successfully. Returns a verification token.
         content:
           application/json:
             schema:
               type: object
               properties:
                 message:
                   type: string
                 verificationToken:
                   type: string
       '400':
         description: Bad Request - Invalid or missing fields.
       '409':
         description: Conflict - A user with this email already exists.
 */
router.post("/signup", signup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Auth]
 *     description: Logs in an existing user and returns JWT tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '200':
 *         description: Login successful. Returns the user and tokens.
         content:
           application/json:
             schema:
               type: object
               properties:
                 user:
                   $ref: '#/components/schemas/User'
                 tokens:
                   $ref: '#/components/schemas/AuthTokens'
       '401':
         description: Unauthorized - Invalid email or password.
       '403':
         description: Forbidden - User is not active.
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/verify-account/{token}:
 *   get:
 *     summary: Verify user account
 *     tags: [Auth]
 *     description: Verifies a user's account using a verification token sent to their email.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The verification token received via email.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Account activated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '404':
 *         description: Not Found - User not found.
 *       '500':
 *         description: Server error or invalid/expired token.
 */
router.get("/verify-account/:token", verifyAccount);

/**
 * @swagger
 * /auth/refreshToken:
 *   post:
 *     summary: Refresh authentication tokens
 *     tags: [Auth]
 *     description: Generates a new access token using a valid refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Tokens refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       '401':
 *         description: Unauthorized - Refresh token is missing or invalid.
 */
router.post("/refreshToken", refreshToken);

export default router;