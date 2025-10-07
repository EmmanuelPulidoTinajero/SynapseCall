
import { Schema, model } from 'mongoose';
import { IMeetingParticipant } from '../interfaces/meeting_participant';

const meetingParticipantSchema = new Schema<IMeetingParticipant>({
  meeting_id: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    enum: ['host', 'cohost', 'moderator', 'member', 'guest'],
    default: 'member',
  },
  joinedAt: { type: Date },
  leftAt: { type: Date },
});

const MeetingParticipant = model<IMeetingParticipant>('MeetingParticipant', meetingParticipantSchema);

export default MeetingParticipant;
