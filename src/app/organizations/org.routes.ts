
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
 *   description: API for managing organizations
 */

/**
 * @swagger
 * /organizations/{orgId}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization data
 *       404:
 *         description: Organization not found
 */
router.get("/:orgId", getOrgById);

/**
 * @swagger
 * /organizations/create:
 *   post:
 *     summary: Create new organization
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               owner:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organization created
 *       400:
 *         description: Bad request
 */
router.post("/create", createNewOrg);

/**
 * @swagger
 * /organizations/{orgId}:
 *   patch:
 *     summary: Update organization by ID
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organization updated
 *       404:
 *         description: Organization not found
 */
router.patch("/:orgId", updateOrgById);

/**
 * @swagger
 * /organizations/{orgId}:
 *   delete:
 *     summary: Delete organization by ID
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: orgId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Organization deleted
 *       404:
 *         description: Organization not found
 */
router.delete("/:orgId", deleteOrgById);

export default router;
