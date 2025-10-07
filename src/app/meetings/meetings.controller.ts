import { Request, Response } from 'express';

export const getMeetings = (req: Request, res: Response) => {
    res.status(200).json({ message: "Lista of meetings" });
};

export const createMeeting = (req: Request, res: Response) => {
    res.status(201).json({ message: "Meeting created" });
};

export const updateMeeting = (req: Request, res: Response) => {
    res.status(200).json({ message: "Meeting updated" });
}

export const deleteMeeting = (req: Request, res: Response) => {
    res.status(200).json({ message: "Meeting deleted" });
}