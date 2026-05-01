"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
class WebhookController {
    facebookAdapter;
    constructor(facebookAdapter) {
        this.facebookAdapter = facebookAdapter;
    }
    // Verificación de Webhook de Facebook
    verifyFacebook(req, res) {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if (mode && token) {
            if (mode === 'subscribe' && token === process.env.FB_VERIFY_TOKEN) {
                console.log('Facebook Webhook Verified');
                res.status(200).send(challenge);
            }
            else {
                res.sendStatus(403);
            }
        }
    }
    // Recepción de mensajes de Facebook
    async handleFacebook(req, res) {
        try {
            await this.facebookAdapter.handleWebhook(req.body);
            res.status(200).send('EVENT_RECEIVED');
        }
        catch (error) {
            console.error('Error handling Facebook webhook:', error);
            res.sendStatus(500);
        }
    }
}
exports.WebhookController = WebhookController;
