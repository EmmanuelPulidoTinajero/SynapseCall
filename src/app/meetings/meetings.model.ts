import { Schema, model } from 'mongoose';
import { IMeeting } from '../interfaces/meeting';

const meetingSchema = new Schema<IMeeting>({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'ended'],
    default: 'scheduled',
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  initiator_id: { type: String, required: true }, 
  isProMeeting: { type: Boolean, default: false },
  meetingSettings: {
    muteOnEntry: { type: Boolean, default: false },
    allowRenaming: { type: Boolean, default: true },
    lockMeeting: { type: Boolean, default: false }
  }
});

const Meeting = model<IMeeting>('Meeting', meetingSchema);

export default Meeting;