import { Request, Response } from "express";
import { IOrganization } from "../interfaces/org";
import Organization from "./org.model";
import { ObjectId } from "mongoose";

export const getOrgById = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.orgId || (req.query.id as string | undefined) || undefined;

        if (!organizationId) {
            return res.status(400).send({ message: "Missing organization id" });
        }

        const searchResult = await Organization.findById(organizationId);

        if (!searchResult) {
            return res.status(404).send({ message: "Organization not found." });
        }

        return res.status(200).json({ message: "Organization found.", searchResult });
    } catch (error) {
        res.status(500).send({ message: "Server error" });
    }
}

export const updateOrgById = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.orgId || (req.query.id as string | undefined) || undefined;

        if (!organizationId) {
            return res.status(400).send({ message: "Missing organization id" });
        }

        const updateInfo = req.body

        if (!updateInfo || !updateInfo.name || !updateInfo.domain || !updateInfo.subscriptionTier) {
            return res.status(400).send({ message: "Missing organization information." });
        }

        const organization: IOrganization = {
            id: updateInfo.id || undefined,
            name: updateInfo.name,
            domain: updateInfo.domain,
            subscriptionTier: updateInfo.subscriptionTier
        }

        const updated = await Organization.findByIdAndUpdate(organizationId, organization);
        return res.status(201).send({ message: "Organization updated", organization: updated });
    } catch (error) {
        res.status(500).send({ message: "Server error" });
    }
}

export const createNewOrg = async (req: Request, res: Response) => {
    try {
        const creationInfo = req.body

        if (!creationInfo || !creationInfo.name || !creationInfo.domain || !creationInfo.subscriptionTier) {
            return res.status(400).send({ message: "Missing organization information" });
        }

        const organization: IOrganization = {
            id: creationInfo.id || undefined,
            name: creationInfo.name,
            domain: creationInfo.domain,
            subscriptionTier: creationInfo.subscriptionTier
        }

        const created = await Organization.create(organization);
        return res.status(201).send({ message: "New organization created", organization: created });
    } catch (error) {
        res.status(500).send({ message: "Server error" });
    }
}

export const deleteOrgById = async (req: Request, res: Response) => {
    try {
        const organizationId = req.params.orgId || (req.query.id as string | undefined) || undefined;

        if (!organizationId) {
            return res.status(400).send({ message: "Missing organization id" });
        }

        const searchResult = await Organization.findById(organizationId);

        if (!searchResult) {
            return res.status(404).send({ message: "Organization not found." });
        }

        const deletionResult = await Organization.deleteOne({ _id: organizationId });

        if (deletionResult.deletedCount && deletionResult.deletedCount > 0) {
            return res.status(200).send({ message: "Organization deleted." });
        } else {
            return res.status(500).send({ message: "Deletion failed." });
        }


    } catch (error) {
        res.status(500).send({ message: "Server error" });
    }
}
