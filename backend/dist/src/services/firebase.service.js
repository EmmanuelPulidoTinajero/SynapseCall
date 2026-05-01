"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const admin = __importStar(require("firebase-admin"));
class FirebaseService {
    static instance;
    db;
    constructor() {
        // Inicialización asumiendo que las credenciales están en variables de entorno o archivo
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(), // O usar SERVICE_ACCOUNT_JSON
            });
        }
        this.db = admin.firestore();
    }
    static getInstance() {
        if (!FirebaseService.instance) {
            FirebaseService.instance = new FirebaseService();
        }
        return FirebaseService.instance;
    }
    async handleInboundMessage(message) {
        const { platform, customerId, customerName, text, organizationId } = message;
        // 1. Buscar o crear el chat
        const chatsRef = this.db.collection('chats');
        const query = await chatsRef
            .where('organizationId', '==', organizationId)
            .where('platform', '==', platform)
            .where('customerId', '==', customerId)
            .limit(1)
            .get();
        let chatId;
        if (query.empty) {
            const newChat = await chatsRef.add({
                organizationId,
                platform,
                customerId,
                customerName,
                status: 'open',
                lastMessage: text,
                lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
                unreadCount: 1,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            chatId = newChat.id;
        }
        else {
            chatId = query.docs[0].id;
            await chatsRef.doc(chatId).update({
                lastMessage: text,
                lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
                unreadCount: admin.firestore.FieldValue.increment(1),
            });
        }
        // 2. Guardar el mensaje en la subcolección
        await chatsRef.doc(chatId).collection('messages').add({
            text,
            senderId: customerId,
            senderName: customerName,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            isFromCustomer: true,
        });
        return chatId;
    }
    async getChatById(chatId) {
        const doc = await this.db.collection('chats').doc(chatId).get();
        return doc.exists ? doc.data() : null;
    }
}
exports.FirebaseService = FirebaseService;
