import { Request, Response } from "express";

export const getOrgById = (req: Request, res: Response) => {
    res.status(200).json({ message: "Getting organization by ID." });
}

export const updateOrgById = (req: Request, res: Response) => {
    res.status(200).json({ message: "Updating organization by ID." });
}

export const createNewOrg = (req: Request, res: Response) => {
    res.status(200).json({ message: "Creating new organization." });
}

export const deleteOrgById = (req: Request, res: Response) => {
    res.status(200).json({ message: "Deleting organization by ID." });
}