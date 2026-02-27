import { Schema, model } from 'mongoose';
import { IAgendaItem } from '../interfaces/agenda_item';

const agendaItemSchema = new Schema<IAgendaItem>({
  agenda_id: { type: Schema.Types.ObjectId, ref: 'Agenda', required: true },
  topic: { type: String, required: true },
  durationInMinutes: { type: Number, required: true },
  presenter_id: { type: Schema.Types.ObjectId, ref: 'User' },
  order: { type: Number, required: true },
  status: { 
      type: String, 
      enum: ['pending', 'active', 'completed'], 
      default: 'pending' 
  },
  actualStartTime: { type: Date }
});

const AgendaItem = model<IAgendaItem>('AgendaItem', agendaItemSchema);

export default AgendaItem;