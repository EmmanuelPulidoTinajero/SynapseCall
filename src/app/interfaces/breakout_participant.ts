import { Types } from "mongoose";

export interface IBreakoutRoomParticipant {
    breakout_room_id: Types.ObjectId;
    user_id: Types.ObjectId;
}