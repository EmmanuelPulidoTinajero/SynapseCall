
import { Schema, model } from 'mongoose';
import { IAgenda } from '../interfaces/agenda';

const agendaSchema = new Schema<IAgenda>({
  meeting_id: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
  currentItemIndex: { type: Number, default: 0 },
  isAutoAdvanceEnabled: { type: Boolean, default: false },
});

const Agenda = model<IAgenda>('Agenda', agendaSchema);

export default Agenda;
