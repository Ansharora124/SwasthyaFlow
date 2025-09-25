import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ScheduleDocument extends Document {
  userId: string; // Clerk user id
  therapistId: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ScheduleDocument>(
  {
    userId: { type: String, required: true, index: true },
    therapistId: { type: String, required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['scheduled', 'cancelled', 'completed'],
      default: 'scheduled',
      index: true,
    },
  },
  { timestamps: true }
);

const Schedule: Model<ScheduleDocument> =
  mongoose.models.Schedule || mongoose.model<ScheduleDocument>('Schedule', scheduleSchema);

export default Schedule;


