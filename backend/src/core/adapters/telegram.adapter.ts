import { Telegraf } from 'telegraf';
import { IPlatformAdapter } from '../interfaces/messaging.interface';
import { FirebaseService } from '../../services/firebase.service';

export class TelegramAdapter implements IPlatformAdapter {
  public platform = 'telegram';
  private bot: Telegraf;
  private firebaseService: FirebaseService;

  constructor(token: string) {
    this.bot = new Telegraf(token);
    this.firebaseService = FirebaseService.getInstance();
  }

  async initialize(): Promise<void> {
    this.bot.on('message', async (ctx) => {
      if ('text' in ctx.message) {
        const message = {
          platform: 'telegram' as const,
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

  async sendMessage(customerId: string, text: string): Promise<void> {
    await this.bot.telegram.sendMessage(customerId, text);
  }
}
