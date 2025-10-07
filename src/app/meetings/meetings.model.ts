
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
  initiator_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Meeting = model<IMeeting>('Meeting', meetingSchema);

export default Meeting;
