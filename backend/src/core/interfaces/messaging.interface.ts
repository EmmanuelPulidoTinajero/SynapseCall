export interface IInboundMessage {
  platform: 'telegram' | 'discord' | 'facebook';
  organizationId: string;
  customerId: string;
  customerName: string;
  text: string;
  timestamp: Date;
}

export interface IOutboundMessage {
  chatId: string;
  text: string;
}

export interface IPlatformAdapter {
  platform: string;
  initialize(): Promise<void>;
  sendMessage(customerId: string, text: string): Promise<void>;
}
