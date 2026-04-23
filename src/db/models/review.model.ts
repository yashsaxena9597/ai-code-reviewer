import mongoose, { Schema, type Document } from 'mongoose';

export interface IReview extends Document {
  repo: string;
  pullNumber: number;
  score: number;
  grade: string;
  passed: boolean;
  findingsCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  filesReviewed: number;
  provider: string;
  headSha: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    repo: { type: String, required: true, index: true },
    pullNumber: { type: Number, required: true },
    score: { type: Number, required: true },
    grade: { type: String, required: true },
    passed: { type: Boolean, required: true },
    findingsCount: { type: Number, required: true },
    criticalCount: { type: Number, default: 0 },
    warningCount: { type: Number, default: 0 },
    infoCount: { type: Number, default: 0 },
    filesReviewed: { type: Number, required: true },
    provider: { type: String, required: true },
    headSha: { type: String, required: true },
  },
  { timestamps: true },
);

reviewSchema.index({ repo: 1, pullNumber: 1 });
reviewSchema.index({ createdAt: -1 });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
