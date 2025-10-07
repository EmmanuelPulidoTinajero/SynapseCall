import { Request, Response } from "express";

export const getPersonalUser = (req: Request, res: Response) => {
    res.status(200).json({ message: "Getting personal profile." });
}

export const updatePersonalUser = (req: Request, res: Response) => {
    res.status(200).json({ message: "Updating personal profile." });
}

export const getUserById = (req: Request, res: Response) => {
    res.status(200).json({ message: "Getting user by ID." });
}

export const deleteUserById = (req: Request, res: Response) => {
    res.status(200).json({ message: "Deleting user by ID." });
}