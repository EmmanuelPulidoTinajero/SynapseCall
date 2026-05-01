"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordAdapter = void 0;
const discord_js_1 = require("discord.js");
const firebase_service_1 = require("../../services/firebase.service");
class DiscordAdapter {
    platform = 'discord';
    client;
    firebaseService;
    constructor(token) {
        this.client = new discord_js_1.Client({
            intents: [
                discord_js_1.GatewayIntentBits.Guilds,
                discord_js_1.GatewayIntentBits.GuildMessages,
                discord_js_1.GatewayIntentBits.MessageContent,
                discord_js_1.GatewayIntentBits.DirectMessages,
            ],
        });
        this.firebaseService = firebase_service_1.FirebaseService.getInstance();
    }
    async initialize() {
        this.client.on('messageCreate', async (message) => {
            if (message.author.bot)
                return;
            const inbound = {
                platform: 'discord',
                organizationId: process.env.DEFAULT_ORG_ID || 'default_org',
                customerId: message.author.id,
                customerName: message.author.username,
                text: message.content,
                timestamp: new Date(),
            };
            await this.firebaseService.handleInboundMessage(inbound);
        });
        await this.client.login(process.env.DISCORD_TOKEN);
        console.log('Discord Bot initialized');
    }
    async sendMessage(customerId, text) {
        const user = await this.client.users.fetch(customerId);
        await user.send(text);
    }
}
exports.DiscordAdapter = DiscordAdapter;
