
import { Schema, model } from 'mongoose';
import { IBreakoutRoomParticipant } from '../interfaces/breakout_participant';

const breakoutRoomParticipantSchema = new Schema<IBreakoutRoomParticipant>({
  breakout_room_id: { type: Schema.Types.ObjectId, ref: 'BreakoutRoom', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const BreakoutRoomParticipant = model<IBreakoutRoomParticipant>('BreakoutRoomParticipant', breakoutRoomParticipantSchema);

export default BreakoutRoomParticipant;
