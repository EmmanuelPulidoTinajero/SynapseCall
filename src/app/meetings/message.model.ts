
import { Schema, model } from 'mongoose';
import { IMessage } from '../interfaces/message';

const messageSchema = new Schema<IMessage>({
  sender_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  meeting_id: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = model<IMessage>('Message', messageSchema);

export default Message;
