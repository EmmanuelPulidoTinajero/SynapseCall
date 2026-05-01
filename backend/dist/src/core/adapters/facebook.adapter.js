"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const firebase_service_1 = require("../../services/firebase.service");
class FacebookAdapter {
    platform = 'facebook';
    pageAccessToken;
    firebaseService;
    constructor(token) {
        this.pageAccessToken = token;
        this.firebaseService = firebase_service_1.FirebaseService.getInstance();
    }
    async initialize() {
        console.log('Facebook Adapter ready (Webhooks managed via Controller)');
    }
    async handleWebhook(payload) {
        if (payload.object === 'page') {
            for (const entry of payload.entry) {
                if (entry.messaging) {
                    for (const event of entry.messaging) {
                        if (event.message && !event.message.is_echo) {
                            const inbound = {
                                platform: 'facebook',
                                organizationId: process.env.DEFAULT_ORG_ID || 'default_org',
                                customerId: event.sender.id,
                                customerName: 'Facebook User', // Se podría obtener vía Graph API
                                text: event.message.text,
                                timestamp: new Date(),
                            };
                            await this.firebaseService.handleInboundMessage(inbound);
                        }
                    }
                }
            }
        }
    }
    async sendMessage(customerId, text) {
        const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${this.pageAccessToken}`;
        await axios_1.default.post(url, {
            recipient: { id: customerId },
            message: { text },
        });
    }
}
exports.FacebookAdapter = FacebookAdapter;
