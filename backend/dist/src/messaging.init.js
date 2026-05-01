"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeMessaging = initializeMessaging;
const telegram_adapter_1 = require("./core/adapters/telegram.adapter");
const discord_adapter_1 = require("./core/adapters/discord.adapter");
const facebook_adapter_1 = require("./core/adapters/facebook.adapter");
const webhook_controller_1 = require("./webhooks/webhook.controller");
async function initializeMessaging(appRouter) {
    const telegramToken = process.env.TELEGRAM_TOKEN;
    const discordToken = process.env.DISCORD_TOKEN;
    const facebookToken = process.env.FB_PAGE_TOKEN;
    // 1. Inicializar Adaptadores
    if (telegramToken) {
        const telegramAdapter = new telegram_adapter_1.TelegramAdapter(telegramToken);
        await telegramAdapter.initialize();
    }
    if (discordToken) {
        const discordAdapter = new discord_adapter_1.DiscordAdapter(discordToken);
        await discordAdapter.initialize();
    }
    if (facebookToken) {
        const facebookAdapter = new facebook_adapter_1.FacebookAdapter(facebookToken);
        await facebookAdapter.initialize();
        const webhookController = new webhook_controller_1.WebhookController(facebookAdapter);
        // 2. Configurar Rutas de Webhook (Facebook requiere endpoints HTTP)
        appRouter.get('/webhooks/facebook', (req, res) => webhookController.verifyFacebook(req, res));
        appRouter.post('/webhooks/facebook', (req, res) => webhookController.handleFacebook(req, res));
        console.log('Facebook Webhook routes configured');
    }
}
