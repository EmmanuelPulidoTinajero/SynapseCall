import { Client, GatewayIntentBits } from 'discord.js';
import { IPlatformAdapter } from '../interfaces/messaging.interface';
import { FirebaseService } from '../../services/firebase.service';

export class DiscordAdapter implements IPlatformAdapter {
  public platform = 'discord';
  private client: Client;
  private firebaseService: FirebaseService;

  constructor(token: string) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
    });
    this.firebaseService = FirebaseService.getInstance();
  }

  async initialize(): Promise<void> {
    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;

      const inbound = {
        platform: 'discord' as const,
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

  async sendMessage(customerId: string, text: string): Promise<void> {
    const user = await this.client.users.fetch(customerId);
    await user.send(text);
  }
}
