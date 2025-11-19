
import { Schema, model } from 'mongoose';
import { IUser } from '../interfaces/user';

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  refresh_tokens: [{ type: String }],
  //organization_id: { type: Schema.Types.ObjectId, ref: 'Organization' },
});

const User = model<IUser>('User', userSchema);

export default User;
