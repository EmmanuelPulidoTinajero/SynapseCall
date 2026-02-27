
import { Schema, model } from 'mongoose';
import { IMeetingSettings } from '../interfaces/meeting_settings';

const meetingSettingsSchema = new Schema<IMeetingSettings>({
  meeting_id: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
  hasWaitingRoom: { type: Boolean, default: false },
  isWhitelistEnabled: { type: Boolean, default: false },
  whitelist: { type: Schema.Types.Mixed },
  allowParticipantsToAddAgendaItems: { type: Boolean, default: false },
  accessCode: { type: String },
});

const MeetingSettings = model<IMeetingSettings>('MeetingSettings', meetingSettingsSchema);

export default MeetingSettings;
