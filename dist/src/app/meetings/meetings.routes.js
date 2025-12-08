"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const meetings_controller_1 = require("./meetings.controller");
const authentication_1 = require("../middlewares/authentication");
const upload_1 = __importDefault(require("../middlewares/upload"));
const agenda_controller_1 = require("./agenda.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Meetings
 *   description: Meetings managment.
 * components:
 *   schemas:
 *     Meeting:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The meeting's unique identifier.
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [scheduled, ongoing, ended]
 *         startTime:
 *           type: string
 *           format: date-time
 *     NewMeeting:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 */
/**
 * @swagger
 * /meetings:
 *   get:
 *     summary: Get all meetings for a user
 *     tags: [Meetings]
 *     description: Retrieves a list of all meetings associated with the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of meetings.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Meeting'
 *       '401':
 *         description: Unauthorized
 *
 *   post:
 *     summary: Create a new meeting
 *     tags: [Meetings]
 *     description: Creates a new meeting for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewMeeting'
 *     responses:
 *       '201':
 *         description: Meeting created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meeting'
 *       '400':
 *         description: Bad Request - Invalid input.
 *       '401':
 *         description: Unauthorized
 */
router.get("/", authentication_1.authentication, meetings_controller_1.getMeetings);
router.post("/", authentication_1.authentication, meetings_controller_1.createMeeting);
/**
 * @swagger
 * /meetings/{id}:
 *   put:
 *     summary: Update an existing meeting
 *     tags: [Meetings]
 *     description: Updates the details of a specific meeting by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the meeting to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewMeeting'
 *     responses:
 *       '200':
 *         description: Meeting updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Meeting'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - User does not have permission to update this meeting.
 *       '404':
 *         description: Not Found - Meeting with this ID does not exist.
 *
 *   delete:
 *     summary: Delete a meeting
 *     tags: [Meetings]
 *     description: Deletes a specific meeting by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the meeting to delete.
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content - Meeting deleted successfully.
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - User does not have permission to delete this meeting.
 *       '404':
 *         description: Not Found - Meeting with this ID does not exist.
 */
router.get("/:id", authentication_1.tryAuthentication, meetings_controller_1.enterMeeting);
router.put("/:id", authentication_1.authentication, meetings_controller_1.updateMeeting);
router.delete("/:id", authentication_1.authentication, meetings_controller_1.deleteMeeting);
router.post("/:id/uploadFiles", upload_1.default.single("file"), meetings_controller_1.uploadFile);
router.get("/:meetingId/agenda", authentication_1.authentication, agenda_controller_1.getAgenda);
router.post("/:meetingId/agenda/items", authentication_1.authentication, agenda_controller_1.addAgendaItem);
router.patch("/agenda/items/:itemId", authentication_1.authentication, agenda_controller_1.updateAgendaItem);
router.delete("/agenda/items/:itemId", authentication_1.authentication, agenda_controller_1.deleteAgendaItem);
exports.default = router;
