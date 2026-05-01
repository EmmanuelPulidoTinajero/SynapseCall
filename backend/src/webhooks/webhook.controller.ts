import { Request, Response } from 'express';
import { FacebookAdapter } from '../core/adapters/facebook.adapter';

export class WebhookController {
  private facebookAdapter: FacebookAdapter;

  constructor(facebookAdapter: FacebookAdapter) {
    this.facebookAdapter = facebookAdapter;
  }

  // Verificación de Webhook de Facebook
  verifyFacebook(req: Request, res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
        console.log('Facebook Webhook Verified');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    }
  }

  // Recepción de mensajes de Facebook
  async handleFacebook(req: Request, res: Response) {
    try {
      await this.facebookAdapter.handleWebhook(req.body);
      res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      console.error('Error handling Facebook webhook:', error);
      res.sendStatus(500);
    }
  }
}
