import * as admin from 'firebase-admin';

export class FirebaseService {
  private static instance: FirebaseService;
  private db: admin.firestore.Firestore;

  private constructor() {
    // Inicialización asumiendo que las credenciales están en variables de entorno o archivo
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(), // O usar SERVICE_ACCOUNT_JSON
      });
    }
    this.db = admin.firestore();
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  async handleInboundMessage(message: any) {
    const { platform, customerId, customerName, text, organizationId } = message;

    // 1. Buscar o crear el chat
    const chatsRef = this.db.collection('chats');
    const query = await chatsRef
      .where('organizationId', '==', organizationId)
      .where('platform', '==', platform)
      .where('customerId', '==', customerId)
      .limit(1)
      .get();

    let chatId: string;

    if (query.empty) {
      const newChat = await chatsRef.add({
        organizationId,
        platform,
        customerId,
        customerName,
        status: 'open',
        lastMessage: text,
        lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
        unreadCount: 1,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      chatId = newChat.id;
    } else {
      chatId = query.docs[0].id;
      await chatsRef.doc(chatId).update({
        lastMessage: text,
        lastMessageTime: admin.firestore.FieldValue.serverTimestamp(),
        unreadCount: admin.firestore.FieldValue.increment(1),
      });
    }

    // 2. Guardar el mensaje en la subcolección
    await chatsRef.doc(chatId).collection('messages').add({
      text,
      senderId: customerId,
      senderName: customerName,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isFromCustomer: true,
    });

    return chatId;
  }

  async getChatById(chatId: string) {
    const doc = await this.db.collection('chats').doc(chatId).get();
    return doc.exists ? doc.data() : null;
  }
}
