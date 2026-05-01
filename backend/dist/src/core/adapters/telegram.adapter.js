"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramAdapter = void 0;
const telegraf_1 = require("telegraf");
const firebase_service_1 = require("../../services/firebase.service");
class TelegramAdapter {
    platform = 'telegram';
    bot;
    firebaseService;
    constructor(token) {
        this.bot = new telegraf_1.Telegraf(token);
        this.firebaseService = firebase_service_1.FirebaseService.getInstance();
    }
    async initialize() {
        this.bot.on('message', async (ctx) => {
            if ('text' in ctx.message) {
                const message = {
                    platform: 'telegram',
                    organizationId: process.env.DEFAULT_ORG_ID || 'default_org',
                    customerId: ctx.from.id.toString(),
                    customerName: ctx.from.first_name + (ctx.from.last_name ? ` ${ctx.from.last_name}` : ''),
                    text: ctx.message.text,
                    timestamp: new Date(),
                };
                await this.firebaseService.handleInboundMessage(message);
            }
        });
        this.bot.launch();
        console.log('Telegram Bot initialized');
    }
    async sendMessage(customerId, text) {
        await this.bot.telegram.sendMessage(customerId, text);
    }
}
exports.TelegramAdapter = TelegramAdapter;
