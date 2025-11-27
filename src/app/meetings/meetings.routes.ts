import { Router } from "express";
import { getMeetings, enterMeeting, createMeeting, updateMeeting, deleteMeeting, uploadFile, createBreakoutRoom, addBreakoutRoomParticipant } from "./meetings.controller";
import { authentication } from "../middlewares/authentication";
import upload from "../middlewares/upload";
const router = Router();

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
router.get("/", authentication , getMeetings);
router.get("/:id", authentication, enterMeeting),
router.post("/", authentication, createMeeting);

/**
 * @swagger
 * /meetings/{id}:
 *   put:
 *     summary: Update an existing meeting
 *     tags: [Meetings]
 *     description: Updates the details of a specific meeting by its ID.
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
router.put("/:id", authentication, updateMeeting);
router.delete("/:id", authentication, deleteMeeting);


// File upload endpoints
router.post("/:id/uploadFiles", upload.single("file"), uploadFile);

/**
 * @swagger
 * /meetings/{id}/breakout-rooms:
 *   post:
 *     summary: Create a breakout room
 *     tags: [Meetings]
 *     description: Creates a new breakout room for a meeting.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the meeting.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Breakout room created successfully.
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.post("/:id/breakout-rooms", authentication, createBreakoutRoom);

/**
 * @swagger
 * /meetings/{id}/breakout-rooms/{breakoutRoomId}/participants:
 *   post:
 *     summary: Add a participant to a breakout room
 *     tags: [Meetings]
 *     description: Adds a participant to a breakout room.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the meeting.
 *         schema:
 *           type: string
 *       - in: path
 *         name: breakoutRoomId
 *         required: true
 *         description: The ID of the breakout room.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Participant added successfully.
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.post("/:id/breakout-rooms/:breakoutRoomId/participants", authentication, addBreakoutRoomParticipant);

export default router;

