
import { Schema, model } from 'mongoose';
import { IOrganization } from '../interfaces/org';

const organizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  subscriptionTier: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free',
  },
});

const Organization = model<IOrganization>('Organization', organizationSchema);

export default Organization;
