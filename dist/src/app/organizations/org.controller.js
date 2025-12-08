"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrgById = exports.updateOrgById = exports.getOrgById = exports.addMemberToOrg = exports.createNewOrg = void 0;
const org_model_1 = __importDefault(require("./org.model"));
const users_model_1 = __importDefault(require("../users/users.model"));
const checkout_server_sdk_1 = __importDefault(require("@paypal/checkout-server-sdk"));
const environment = process.env.PAYPAL_ENVIRONMENT === "live"
    ? new checkout_server_sdk_1.default.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new checkout_server_sdk_1.default.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const client = new checkout_server_sdk_1.default.core.PayPalHttpClient(environment);
const createNewOrg = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, orderId } = req.body;
        const file = req.file;
        if (!name || !orderId) {
            return res.status(400).json({ message: "Nombre y OrderID de pago requeridos." });
        }
        const request = new checkout_server_sdk_1.default.orders.OrdersGetRequest(orderId);
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
        const existingOrg = await org_model_1.default.findOne({ ownerId: userId });
        if (existingOrg) {
            return res.status(409).json({ message: "Ya eres dueño de una organización." });
        }
        let logoUrl = "";
        if (file) {
            logoUrl = file.location || file.key;
        }
        const newOrg = await org_model_1.default.create({
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
        await users_model_1.default.findByIdAndUpdate(userId, { organizationId: newOrg._id });
        return res.status(201).json({ message: "Organización creada y suscripción activa", organization: newOrg });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear la organización" });
    }
};
exports.createNewOrg = createNewOrg;
const addMemberToOrg = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email } = req.body;
        const { orgId } = req.params;
        const org = await org_model_1.default.findById(orgId);
        if (!org)
            return res.status(404).json({ message: "Organización no encontrada" });
        if (org.ownerId.toString() !== userId) {
            return res.status(403).json({ message: "Solo el dueño puede agregar miembros." });
        }
        if (org.members.length >= 10) {
            return res.status(400).json({ message: "Límite de 10 usuarios alcanzado." });
        }
        const userToInvite = await users_model_1.default.findOne({ email });
        if (!userToInvite) {
            return res.status(404).json({ message: "Usuario no registrado en la plataforma." });
        }
        if (userToInvite.organizationId) {
            return res.status(409).json({ message: "El usuario ya pertenece a una organización." });
        }
        org.members.push(userToInvite._id);
        await org.save();
        userToInvite.organizationId = org._id;
        await userToInvite.save();
        return res.status(200).json({ message: "Usuario agregado exitosamente." });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al agregar miembro" });
    }
};
exports.addMemberToOrg = addMemberToOrg;
const getOrgById = async (req, res) => {
    try {
        const orgId = req.params.orgId;
        const org = await org_model_1.default.findById(orgId).populate('members', 'name email');
        if (!org)
            return res.status(404).json({ message: "Organización no encontrada" });
        return res.status(200).json(org);
    }
    catch (e) {
        return res.status(500).json({ message: "Error del servidor" });
    }
};
exports.getOrgById = getOrgById;
const updateOrgById = async (req, res) => {
    try {
        const orgId = req.params.orgId;
        const userId = req.user.id;
        const updateInfo = req.body;
        const org = await org_model_1.default.findById(orgId);
        if (!org)
            return res.status(404).json({ message: "Organización no encontrada" });
        if (org.ownerId.toString() !== userId) {
            return res.status(403).json({ message: "No tienes permiso para editar esta organización" });
        }
        if (!updateInfo.name) {
            return res.status(400).json({ message: "Información faltante" });
        }
        const updated = await org_model_1.default.findByIdAndUpdate(orgId, { name: updateInfo.name }, { new: true });
        return res.status(200).json({ message: "Organización actualizada", organization: updated });
    }
    catch (error) {
        res.status(500).json({ message: "Error del servidor" });
    }
};
exports.updateOrgById = updateOrgById;
const deleteOrgById = async (req, res) => {
    try {
        const orgId = req.params.orgId;
        const userId = req.user.id;
        const org = await org_model_1.default.findById(orgId);
        if (!org)
            return res.status(404).json({ message: "Organización no encontrada" });
        if (org.ownerId.toString() !== userId) {
            return res.status(403).json({ message: "No tienes permiso para eliminar esta organización" });
        }
        await users_model_1.default.updateMany({ organizationId: orgId }, { $unset: { organizationId: "" } });
        await org_model_1.default.deleteOne({ _id: orgId });
        return res.status(200).json({ message: "Organización eliminada y miembros desvinculados." });
    }
    catch (error) {
        res.status(500).json({ message: "Error del servidor" });
    }
};
exports.deleteOrgById = deleteOrgById;
