import { TelegramAdapter } from './core/adapters/telegram.adapter';
import { DiscordAdapter } from './core/adapters/discord.adapter';
import { FacebookAdapter } from './core/adapters/facebook.adapter';
import { WebhookController } from './webhooks/webhook.controller';
import { Router } from 'express';

export async function initializeMessaging(appRouter: Router) {
  const telegramToken = process.env.TELEGRAM_TOKEN;
  const discordToken = process.env.DISCORD_TOKEN;
  const facebookToken = process.env.FB_PAGE_TOKEN;

  // 1. Inicializar Adaptadores
  if (telegramToken) {
    const telegramAdapter = new TelegramAdapter(telegramToken);
    await telegramAdapter.initialize();
  }

  if (discordToken) {
    const discordAdapter = new DiscordAdapter(discordToken);
    await discordAdapter.initialize();
  }

  if (facebookToken) {
    const facebookAdapter = new FacebookAdapter(facebookToken);
    await facebookAdapter.initialize();
    
    const webhookController = new WebhookController(facebookAdapter);

    // 2. Configurar Rutas de Webhook (Facebook requiere endpoints HTTP)
    appRouter.get('/webhooks/facebook', (req, res) => webhookController.verifyFacebook(req, res));
    appRouter.post('/webhooks/facebook', (req, res) => webhookController.handleFacebook(req, res));
    
    console.log('Facebook Webhook routes configured');
  }
}
