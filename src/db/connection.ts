import mongoose from 'mongoose';
import logger from '../utils/logger';

let isConnected = false;

export async function connectDB(uri: string): Promise<void> {
  if (isConnected) return;

  try {
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection failed', { error });
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('Disconnected from MongoDB');
}
