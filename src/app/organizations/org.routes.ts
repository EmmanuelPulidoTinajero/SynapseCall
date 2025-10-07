import { Router } from "express";
import {
    getOrgById,
    createNewOrg,
    updateOrgById,
    deleteOrgById
} from "./org.controller"

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Orgs managment.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The organization's unique identifier.
 *         name:
 *           type: string
 *         owner:
 *           type: string
 *     NewOrganization:
 *       type: object
 *       required:
 *         - name
 *         - owner
 *       properties:
 *         name:
 *           type: string
 *         owner:
 *           type: string
 *     UpdateOrganization:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 */

/**
 * @swagger
 * /organizations/{orgId}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organizations]
 *     description: Retrieves a specific organization by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         description: The ID of the organization to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Organization data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Organization not found
 */
router.get("/:orgId", getOrgById);

/**
 * @swagger
 * /organizations/create:
 *   post:
 *     summary: Create new organization
 *     tags: [Organizations]
 *     description: Creates a new organization.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewOrganization'
 *     responses:
 *       '201':
 *         description: Organization created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       '400':
 *         description: Bad Request - Invalid input.
 *       '401':
 *         description: Unauthorized
 */
router.post("/create", createNewOrg);

/**
 * @swagger
 * /organizations/{orgId}:
 *   patch:
 *     summary: Update organization by ID
 *     tags: [Organizations]
 *     description: Updates the details of a specific organization by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         description: The ID of the organization to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrganization'
 *     responses:
 *       '200':
 *         description: Organization updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Organization not found
 */
router.patch("/:orgId", updateOrgById);

/**
 * @swagger
 * /organizations/{orgId}:
 *   delete:
 *     summary: Delete organization by ID
 *     tags: [Organizations]
 *     description: Deletes a specific organization by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         description: The ID of the organization to delete.
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content - Organization deleted successfully.
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Organization not found
 */
router.delete("/:orgId", deleteOrgById);

export default router;