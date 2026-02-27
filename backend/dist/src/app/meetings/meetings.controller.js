"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.deleteMeeting = exports.updateMeeting = exports.createMeeting = exports.enterMeeting = exports.getMeetings = void 0;
const mongoose_1 = require("mongoose");
const meetings_model_1 = __importDefault(require("./meetings.model"));
const users_model_1 = __importDefault(require("../users/users.model"));
const upload_1 = require("../middlewares/upload");
const s3_utils_1 = require("../utils/s3.utils");
const axios_1 = __importDefault(require("axios"));
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const getTwilioIceServers = async () => {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
        return [{ urls: 'stun:stun.l.google.com:19302' }];
    }
    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Tokens.json`;
        const response = await axios_1.default.post(url, null, {
            auth: { username: TWILIO_ACCOUNT_SID, password: TWILIO_AUTH_TOKEN }
        });
        return response.data.ice_servers;
    }
    catch (error) {
        return [{ urls: 'stun:stun.l.google.com:19302' }];
    }
};
const getMeetings = async (req, res) => {
    try {
        const meetings = await meetings_model_1.default.find({});
        if (meetings.length > 0) {
            return res.status(200).send({ message: "Meetings found.", meetings });
        }
        else {
            return res.status(200).send({ message: "No meetings created yet." });
        }
    }
    catch (error) {
        return res.status(500).send({ message: "Server error" });
    }
};
exports.getMeetings = getMeetings;
const enterMeeting = async (req, res) => {
    try {
        const meetingId = req.params.id;
        const currentUser = req.user;
        if (!meetingId || !mongoose_1.Types.ObjectId.isValid(meetingId)) {
            return res.status(404).send("<h1>Reunión no encontrada (ID inválido)</h1>");
        }
        const meeting = await meetings_model_1.default.findById(meetingId);
        if (!meeting) {
            return res.status(404).send("<h1>Reunión no encontrada</h1>");
        }
        const hostUser = await users_model_1.default.findById(meeting.initiator_id).populate('organizationId');
        let isPro = false;
        let orgData = null;
        if (hostUser) {
            const org = hostUser.organizationId;
            const isPersonalPro = hostUser.personalSubscription.status === 'active';
            const isOrgPro = org && org.subscription.status === 'active';
            isPro = isPersonalPro || isOrgPro;
            if (isOrgPro && org) {
                orgData = { name: org.name, logo: org.logoUrl };
            }
        }
        const isHost = currentUser ? currentUser.id === meeting.initiator_id : false;
        const s3Bucket = upload_1.s3Storage;
        let keys = [];
        let links = [];
        try {
            if (process.env.S3_ACCESS_KEY) {
                keys = await (0, s3_utils_1.listAllS3Keys)(meetingId);
                links = await (0, s3_utils_1.getS3DownloadLink)(keys);
            }
        }
        catch (s3Error) {
            console.warn("S3 no disponible, continuando sin archivos.");
        }
        const iceServers = await getTwilioIceServers();
        res.render("meeting", {
            layout: false,
            meetingId: meetingId,
            meetingTitle: meeting.title,
            isPro: isPro,
            isHost: isHost,
            orgName: orgData?.name,
            orgLogo: orgData?.logo,
            s3Bucket: s3Bucket,
            downloadLinksJson: JSON.stringify(links),
            iceServersJson: JSON.stringify(iceServers)
        });
    }
    catch (error) {
        console.error("Error entering meeting:", error);
        return res.status(500).send("<h1>Error del servidor al entrar a la reunión</h1>");
    }
};
exports.enterMeeting = enterMeeting;
const createMeeting = async (req, res) => {
    try {
        const newMeeting = req.body;
        const userId = req.user.id;
        if (!newMeeting || !newMeeting.title) {
            return res.status(400).send({ message: "El título de la reunión es obligatorio." });
        }
        ;
        const startTime = newMeeting.startTime ? new Date(newMeeting.startTime) : new Date();
        const description = newMeeting.description || ""; // Si no hay descripción, string vacío
        const status = newMeeting.status || "scheduled";
        if (isNaN(startTime.getTime())) {
            return res.status(400).send({ message: 'Formato de fecha inválido.' });
        }
        const end = newMeeting.endTime ? new Date(newMeeting.endTime) : undefined;
        const meeting = {
            id: newMeeting.id,
            title: newMeeting.title,
            description: description,
            status: status,
            startTime: startTime,
            endTime: end,
            initiator_id: userId,
            isProMeeting: false,
            meetingSettings: {
                muteOnEntry: false,
                allowRenaming: true,
                lockMeeting: false
            }
        };
        const created = await meetings_model_1.default.create(meeting);
        return res.status(201).json({ message: "Meeting created", meeting: created });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error." });
    }
};
exports.createMeeting = createMeeting;
const updateMeeting = async (req, res) => {
    try {
        const meetingId = req.params.id || req.query.id || undefined;
        const updateInfo = req.body;
        if (!updateInfo) {
            return res.status(400).send({ message: "Missing meeting information." });
        }
        ;
        const updatedMeeting = {
            id: updateInfo.id,
            title: updateInfo.title,
            description: updateInfo.description,
            status: updateInfo.status,
            startTime: updateInfo.startTime,
            endTime: updateInfo.endTime
        };
        const updated = await meetings_model_1.default.findByIdAndUpdate(meetingId, updatedMeeting, { new: true });
        return res.status(200).send({ message: "Meeting updated", meeting: updated });
    }
    catch (error) {
        return res.status(500).send({ message: "Server error." });
    }
};
exports.updateMeeting = updateMeeting;
const deleteMeeting = async (req, res) => {
    try {
        const meetingId = req.params.id;
        if (!meetingId)
            return res.status(400).send({ message: "Missing meeting id." });
        const meeting = await meetings_model_1.default.findById({ _id: meetingId });
        if (!meeting)
            return res.status(404).send({ message: "Meeting not found." });
        await meetings_model_1.default.deleteOne({ _id: meetingId });
        return res.status(200).send({ message: "Meeting deleted." });
    }
    catch (error) {
        return res.status(500).send({ message: "Server error." });
    }
};
exports.deleteMeeting = deleteMeeting;
const uploadFile = async (req, res) => {
    try {
        const meetingId = req.params.id;
        const file = req.file;
        const io = global.io;
        if (!file)
            return res.status(400).send({ message: 'No file uploaded.' });
        const generatedLinks = await (0, s3_utils_1.getS3DownloadLink)([file.key]);
        const presignedUrl = generatedLinks[0]?.url || file.location;
        const fileData = {
            key: file.key,
            url: presignedUrl,
            originalName: file.originalname
        };
        if (io)
            io.to(meetingId).emit("file-uploaded", fileData);
        return res.status(200).json({ message: 'Upload successful', file: fileData });
    }
    catch (error) {
        console.error("Upload error:", error);
        return res.status(500).send({ message: 'Upload failed' });
    }
};
exports.uploadFile = uploadFile;
