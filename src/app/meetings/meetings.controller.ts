import { Request, Response } from 'express';
import { Types } from 'mongoose'; 
import Meeting from './meetings.model';
import { IMeeting } from '../interfaces/meeting';
import User from '../users/users.model'; 
import Organization from '../organizations/org.model'; 
import { s3Storage } from '../middlewares/upload';
import { getS3DownloadLink , listAllS3Keys} from '../utils/s3.utils';
import axios from 'axios';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

const getTwilioIceServers = async () => {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
        return [{ urls: 'stun:stun.l.google.com:19302' }];
    }

    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Tokens.json`;
        const response = await axios.post(url, null, {
            auth: { username: TWILIO_ACCOUNT_SID, password: TWILIO_AUTH_TOKEN }
        });
        return response.data.ice_servers;
    } catch (error) {
        return [{ urls: 'stun:stun.l.google.com:19302' }];
    }
};

export const getMeetings = async (req: Request, res: Response) => {
    try {
        const meetings = await Meeting.find({});
        if (meetings.length > 0) {
            return res.status(200).send({ message: "Meetings found.", meetings });
        } else {
            return res.status(200).send({ message: "No meetings created yet." });
        }
    } catch (error) {
        return res.status(500).send({ message: "Server error" });
    }
};

export const enterMeeting = async (req: Request, res: Response) => {
    try {
        const meetingId = req.params.id;
        const currentUser = (req as any).user; 
        if (!meetingId || !Types.ObjectId.isValid(meetingId)) {
            return res.status(404).send("<h1>Reunión no encontrada (ID inválido)</h1>");
        }
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).send("<h1>Reunión no encontrada</h1>");
        }

        const hostUser = await User.findById(meeting.initiator_id).populate('organizationId');
        
        let isPro = false;
        let orgData = null;
        if (hostUser) {
            const org = hostUser.organizationId as any;
            const isPersonalPro = hostUser.personalSubscription.status === 'active';
            const isOrgPro = org && org.subscription.status === 'active';   
            isPro = isPersonalPro || isOrgPro;

            if (isOrgPro && org) {
                orgData = { name: org.name, logo: org.logoUrl };
            }
        }
        const isHost = currentUser ? currentUser.id === meeting.initiator_id : false;
        const s3Bucket = s3Storage;
        let keys: string[] = [];
        let links: any[] = [];
        
        try {
            if (process.env.S3_ACCESS_KEY) {
                keys = await listAllS3Keys(meetingId);
                links = await getS3DownloadLink(keys);
            }
        } catch (s3Error) {
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

    } catch (error) {
        console.error("Error entering meeting:", error);
        return res.status(500).send("<h1>Error del servidor al entrar a la reunión</h1>");
    }
};

export const createMeeting = async (req: Request, res: Response) => {
    try {
        const newMeeting = req.body;
        const userId = (req as any).user.id; 

        
        if (!newMeeting || !newMeeting.title) {
            return res.status(400).send({ message: "El título de la reunión es obligatorio." });
        };


        const startTime = newMeeting.startTime ? new Date(newMeeting.startTime) : new Date();
        const description = newMeeting.description || ""; // Si no hay descripción, string vacío
        const status = newMeeting.status || "scheduled";

        if (isNaN(startTime.getTime())) {
            return res.status(400).send({ message: 'Formato de fecha inválido.' });
        }
        
        const end = newMeeting.endTime ? new Date(newMeeting.endTime) : undefined;

        const meeting: IMeeting = {
            id: newMeeting.id,
            title: newMeeting.title,
            description: description,
            status: status,
            startTime: startTime,
            endTime: end as any,
            initiator_id: userId,
            isProMeeting: false,
            meetingSettings: {
                muteOnEntry: false,
                allowRenaming: true,
                lockMeeting: false
            }
        }

        const created = await Meeting.create(meeting);

        return res.status(201).json({ message: "Meeting created", meeting: created });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Server error." });
    }
};

export const updateMeeting = async (req: Request, res: Response) => {
    try {
        const meetingId = req.params.id || (req.query.id as string | undefined) || undefined;
        const updateInfo = req.body;

        if (!updateInfo) {
            return res.status(400).send({ message: "Missing meeting information." });
        };

        const updatedMeeting: Partial<IMeeting> = {
            id: updateInfo.id,
            title: updateInfo.title,
            description: updateInfo.description,
            status: updateInfo.status,
            startTime: updateInfo.startTime,
            endTime: updateInfo.endTime
        };

        const updated = await Meeting.findByIdAndUpdate(meetingId, updatedMeeting, { new: true });

        return res.status(200).send({ message: "Meeting updated", meeting: updated });
    } catch (error) {
       return res.status(500).send({ message: "Server error." });
    }
}

export const deleteMeeting = async (req: Request, res: Response) => {
    try {
        const meetingId = req.params.id;
        if (!meetingId) return res.status(400).send({ message: "Missing meeting id." });
        
        const meeting = await Meeting.findById({ _id: meetingId });
        if (!meeting) return res.status(404).send({ message: "Meeting not found." });

        await Meeting.deleteOne({ _id: meetingId });
        return res.status(200).send({ message: "Meeting deleted." });
    } catch (error) {
        return res.status(500).send({ message: "Server error." });
    }
}

export const uploadFile = async (req: Request, res: Response) => {
    try {
        const meetingId = req.params.id;
        const file = (req as any).file;
        const io = (global as any).io;

        if (!file) return res.status(400).send({ message: 'No file uploaded.' });

        const generatedLinks = await getS3DownloadLink([file.key]);
        const presignedUrl = generatedLinks[0]?.url || file.location;

        const fileData = {
            key: file.key,
            url: presignedUrl,
            originalName: file.originalname
        };

        if (io) io.to(meetingId).emit("file-uploaded", fileData);

        return res.status(200).json({ message: 'Upload successful', file: fileData });
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).send({ message: 'Upload failed' });
    }
};