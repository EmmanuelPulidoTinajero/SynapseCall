
import { Schema, model } from 'mongoose';
import { IBreakoutRoom } from '../interfaces/breakout';

const breakoutRoomSchema = new Schema<IBreakoutRoom>({
  meeting_id: { type: Schema.Types.ObjectId, ref: 'Meeting', required: true },
  roomName: { type: String, required: true },
});

const BreakoutRoom = model<IBreakoutRoom>('BreakoutRoom', breakoutRoomSchema);

export default BreakoutRoom;
