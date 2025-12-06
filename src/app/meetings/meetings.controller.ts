import { Request, Response } from 'express';
import Meeting from './meetings.model';
import { IMeeting } from '../interfaces/meeting';
import User from '../users/users.model'; // Importar User
import Organization from '../organizations/org.model'; // Importar Organization
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
            auth: {
                username: TWILIO_ACCOUNT_SID,
                password: TWILIO_AUTH_TOKEN
            }
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
        const currentUser = (req as any).user; // Viene del middleware (puede ser null si es invitado)


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
                orgData = {
                    name: org.name,
                    logo: org.logoUrl
                };
            }
        }

        
        const isHost = currentUser && currentUser.id === meeting.initiator_id;


        const s3Bucket = s3Storage;
        const keys = await listAllS3Keys(meetingId);
        const links = await getS3DownloadLink(keys);
        const iceServers = await getTwilioIceServers();

        
        res.render("meeting", {
            layout: false, // La vista de reunión suele tener su propio layout o ninguno
            meetingId: meetingId,
            meetingTitle: meeting.title,
            isPro: isPro,
            isHost: isHost,
            orgName: orgData?.name,
            orgLogo: orgData?.logo,
            s3Bucket: s3Bucket, // (Opcional si no lo usas en la vista directamente)
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

        if (!newMeeting || !newMeeting.title || !newMeeting.description || !newMeeting.status || !newMeeting.startTime) {
            return res.status(400).send({ message: "Missing meeting information." });
        };

        const start = new Date(newMeeting.startTime);
        if (isNaN(start.getTime())) {
            return res.status(400).send({ message: 'Invalid startTime format. Use ISO date string.' });
        }
        const end = newMeeting.endTime ? new Date(newMeeting.endTime) : undefined;
        if (newMeeting.endTime && isNaN(end!.getTime())) {
            return res.status(400).send({ message: 'Invalid endTime format. Use ISO date string.' });
        }

        const meeting: IMeeting = {
            id: newMeeting.id,
            title: newMeeting.title,
            description: newMeeting.description,
            status: newMeeting.status,
            startTime: start,
            endTime: end as any
        }

        const created = await Meeting.create(meeting);

        return res.status(201).json({ message: "Meeting created", meeting: created });
    } catch (error) {
        return res.status(500).send({ message: "Server error." });
    }

};

export const updateMeeting = async (req: Request, res: Response) => {
    try {
        const meetingId = req.params.id || (req.query.id as string | undefined) || undefined;
        const updateInfo = req.body;

        if (!updateInfo || !updateInfo.title || !updateInfo.description || !updateInfo.status || !updateInfo.startTime || !updateInfo.endTime) {
            return res.status(400).send({ message: "Missing meeting information." });
        };

        const updatedMeeting: IMeeting = {
            id: updateInfo.id,
            title: updateInfo.title,
            description: updateInfo.description,
            status: updateInfo.status,
            startTime: updateInfo.startTime,
            endTime: updateInfo.endTime
        };

        const updated = await Meeting.findByIdAndUpdate(meetingId, updatedMeeting);

        return res.status(200).send({ message: "Meeting updated", meeting: updated });
    } catch (error) {
       return res.status(500).send({ message: "Server error." });
    }
}

export const deleteMeeting = async (req: Request, res: Response) => {
    try {
        const meetingId = req.params.id || (req.query.id as string | undefined) || undefined;

        if (!meetingId) {
            return res.status(400).send({ message: "Missing meeting id." });
        }

        const meeting = await Meeting.findById({ _id: meetingId });

        if (!meeting) {
            return res.status(404).send({ message: "Meeting not found." });
        }

        const deletionResult = await Meeting.deleteOne({ _id: meetingId });

        if (deletionResult.deletedCount && deletionResult.deletedCount > 0) {
            return res.status(200).send({ message: "Meeting deleted." });
        } else {
            return res.status(500).send({ message: "Deletion failed." });
        }
    } catch (error) {
        return res.status(500).send({ message: "Server error." });
    }
}

export const uploadFile = async (req: Request, res: Response) => {
    try {
        const meetingId = req.params.id;
        const file = (req as any).file;
        const io = (global as any).io;

        if (!file) {
            return res.status(400).send({ message: 'No file uploaded.' });
        }

        const generatedLinks = await getS3DownloadLink([file.key]);
        const presignedUrl = generatedLinks[0]?.url || file.location;

        const fileData = {
            key: file.key,
            url: presignedUrl,
            originalName: file.originalname
        };

        if (io) {
            io.to(meetingId).emit("file-uploaded", fileData);
        }

        return res.status(200).json({ message: 'Upload successful', file: fileData });
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).send({ message: 'Upload failed' });
    }
};