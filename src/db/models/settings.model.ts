import mongoose, { Schema, type Document } from 'mongoose';

export interface ISettings extends Document {
  repo: string;
  installationId: number;
  provider: 'claude' | 'openai';
  aiModel: string;
  categories: string[];
  maxFiles: number;
  maxLines: number;
  minScoreToPass: number;
  autoSuggestFixes: boolean;
  ignoredFiles: string[];
  ignoredDirectories: string[];
  enabled: boolean;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    repo: { type: String, required: true, unique: true },
    installationId: { type: Number, required: true },
    provider: { type: String, enum: ['claude', 'openai'], default: 'claude' },
    aiModel: { type: String, default: 'claude-sonnet-4-6' },
    categories: { type: [String], default: ['code-quality', 'security', 'performance'] },
    maxFiles: { type: Number, default: 20 },
    maxLines: { type: Number, default: 500 },
    minScoreToPass: { type: Number, default: 6 },
    autoSuggestFixes: { type: Boolean, default: true },
    ignoredFiles: { type: [String], default: [] },
    ignoredDirectories: { type: [String], default: [] },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
