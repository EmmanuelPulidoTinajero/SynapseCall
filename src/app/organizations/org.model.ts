import { Schema, model } from 'mongoose';
import { IOrganization } from '../interfaces/org';

const organizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  logoUrl: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  subscription: {
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'past_due'], 
        default: 'inactive' 
    },
    plan: { 
        type: String, 
        enum: ['organization_tier', 'free'], 
        default: 'free' 
    },
    expiresAt: { type: Date },
    paypalSubscriptionId: { type: String }
  }
});

const Organization = model<IOrganization>('Organization', organizationSchema);

export default Organization;