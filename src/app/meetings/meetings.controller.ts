import { Request, Response } from 'express';
import Meeting from './meetings.model';
import { IMeeting } from '../interfaces/meeting';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Storage } from '../middlewares/upload';
import { getS3DownloadLink , listAllS3Keys} from '../utils/s3.utils';

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
        const s3Bucket = s3Storage;
        const keys = await listAllS3Keys(meetingId);
        const links = await getS3DownloadLink(keys);

        // Pass structured links as JSON so the template can render filenames and URLs
        res.render("meeting", { meetingId: meetingId, s3Bucket: s3Bucket, downloadLinksJson: JSON.stringify(links) });
    } catch (error) {
        return res.status(500).send({ message: "Server error" });
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

export const uploadFile = (req: Request, res: Response) => {
    try {
        const meetingId = req.params.id;
        console.log('Uploaded file info:', (req as any).file);

        return res.redirect(`/meetings/${meetingId}`);
    } catch (error) {
        console.error('uploadFile error:', error);
        return res.status(500).send({ message: 'Upload failed' });
    }
};