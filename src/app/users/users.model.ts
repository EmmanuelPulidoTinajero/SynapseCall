import { Schema, model } from 'mongoose';
import { IUser } from '../interfaces/user';

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  refresh_tokens: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  googleId: { type: String },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
  personalSubscription: {
    status: {
        type: String,
        enum: ['active', 'inactive', 'past_due'],
        default: 'inactive'
    },
    plan: {
        type: String,
        enum: ['individual_pro', 'free'],
        default: 'free'
    },
    expiresAt: { type: Date },
    paypalSubscriptionId: { type: String }
  }
});

const User = model<IUser>('User', userSchema);

export default User;