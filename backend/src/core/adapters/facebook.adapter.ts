import axios from 'axios';
import { IPlatformAdapter } from '../interfaces/messaging.interface';
import { FirebaseService } from '../../services/firebase.service';

export class FacebookAdapter implements IPlatformAdapter {
  public platform = 'facebook';
  private pageAccessToken: string;
  private firebaseService: FirebaseService;

  constructor(token: string) {
    this.pageAccessToken = token;
    this.firebaseService = FirebaseService.getInstance();
  }

  async initialize(): Promise<void> {
    console.log('Facebook Adapter ready (Webhooks managed via Controller)');
  }

  async handleWebhook(payload: any): Promise<void> {
    if (payload.object === 'page') {
      for (const entry of payload.entry) {
        if (entry.messaging) {
          for (const event of entry.messaging) {
            if (event.message && !event.message.is_echo) {
              const inbound = {
                platform: 'facebook' as const,
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

  async sendMessage(customerId: string, text: string): Promise<void> {
    const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${this.pageAccessToken}`;
    await axios.post(url, {
      recipient: { id: customerId },
      message: { text },
    });
  }
}
