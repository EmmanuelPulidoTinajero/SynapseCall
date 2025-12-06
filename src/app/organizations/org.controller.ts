import { Request, Response } from "express";
import Organization from "./org.model";
import User from "../users/users.model";
import { Types } from "mongoose";
import paypal from "@paypal/checkout-server-sdk";

const environment = process.env.PAYPAL_ENVIRONMENT === "live"
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID!, process.env.PAYPAL_CLIENT_SECRET!);

const client = new paypal.core.PayPalHttpClient(environment);

export const createNewOrg = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { name, orderId } = req.body;
        const file = (req as any).file;

        if (!name || !orderId) {
            return res.status(400).json({ message: "Nombre y OrderID de pago requeridos." });
        }

        const request = new paypal.orders.OrdersGetRequest(orderId);
        const order = await client.execute(request);

        if (order.result.status !== "COMPLETED") {
            return res.status(402).json({ message: "El pago no se ha completado." });
        }

        const purchaseUnit = order.result.purchase_units[0];
        const amount = purchaseUnit.amount.value;
        const currency = purchaseUnit.amount.currency_code;

        if (amount !== "5.00" || currency !== "USD") {
            return res.status(400).json({ message: "Monto de pago incorrecto." });
        }

        const existingOrg = await Organization.findOne({ ownerId: userId });
        if (existingOrg) {
            return res.status(409).json({ message: "Ya eres dueño de una organización." });
        }

        let logoUrl = "";
        if (file) {
            logoUrl = file.location || file.key;
        }

        const newOrg = await Organization.create({
            name,
            ownerId: userId,
            logoUrl,
            members: [userId],
            subscription: {
                status: 'active',
                plan: 'organization_tier',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                paypalSubscriptionId: orderId
            }
        });

        await User.findByIdAndUpdate(userId, { organizationId: newOrg._id });

        return res.status(201).json({ message: "Organización creada y suscripción activa", organization: newOrg });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear la organización" });
    }
}

export const addMemberToOrg = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { email } = req.body;
        const { orgId } = req.params;

        const org = await Organization.findById(orgId);

        if (!org) return res.status(404).json({ message: "Organización no encontrada" });

        if (org.ownerId.toString() !== userId) {
            return res.status(403).json({ message: "Solo el dueño puede agregar miembros." });
        }

        if (org.members.length >= 10) {
            return res.status(400).json({ message: "Límite de 10 usuarios alcanzado." });
        }

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) {
            return res.status(404).json({ message: "Usuario no registrado en la plataforma." });
        }

        if (userToInvite.organizationId) {
            return res.status(409).json({ message: "El usuario ya pertenece a una organización." });
        }

        org.members.push(userToInvite._id as Types.ObjectId);
        await org.save();

        userToInvite.organizationId = org._id as Types.ObjectId;
        await userToInvite.save();

        return res.status(200).json({ message: "Usuario agregado exitosamente." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al agregar miembro" });
    }
}

export const getOrgById = async (req: Request, res: Response) => {
    try {
        const orgId = req.params.orgId;
        const org = await Organization.findById(orgId).populate('members', 'name email');
        
        if (!org) return res.status(404).json({ message: "Organización no encontrada" });
        
        return res.status(200).json(org);
    } catch (e) {
        return res.status(500).json({ message: "Error del servidor" });
    }
}

export const updateOrgById = async (req: Request, res: Response) => {
    try {
        const orgId = req.params.orgId;
        const userId = (req as any).user.id;
        const updateInfo = req.body;

        const org = await Organization.findById(orgId);
        if (!org) return res.status(404).json({ message: "Organización no encontrada" });

        if (org.ownerId.toString() !== userId) {
            return res.status(403).json({ message: "No tienes permiso para editar esta organización" });
        }

        if (!updateInfo.name) {
            return res.status(400).json({ message: "Información faltante" });
        }

        const updated = await Organization.findByIdAndUpdate(orgId, { name: updateInfo.name }, { new: true });
        return res.status(200).json({ message: "Organización actualizada", organization: updated });
    } catch (error) {
        res.status(500).json({ message: "Error del servidor" });
    }
}

export const deleteOrgById = async (req: Request, res: Response) => {
    try {
        const orgId = req.params.orgId;
        const userId = (req as any).user.id;

        const org = await Organization.findById(orgId);
        if (!org) return res.status(404).json({ message: "Organización no encontrada" });

        if (org.ownerId.toString() !== userId) {
            return res.status(403).json({ message: "No tienes permiso para eliminar esta organización" });
        }

        await User.updateMany({ organizationId: orgId }, { $unset: { organizationId: "" } });

        await Organization.deleteOne({ _id: orgId });

        return res.status(200).json({ message: "Organización eliminada y miembros desvinculados." });

    } catch (error) {
        res.status(500).json({ message: "Error del servidor" });
    }
}