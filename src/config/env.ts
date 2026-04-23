import dotenv from 'dotenv';
import { z } from 'zod/v4';

dotenv.config();

const envSchema = z.object({
  // GitHub App
  GITHUB_APP_ID: z.string().min(1),
  GITHUB_APP_PRIVATE_KEY: z.string().min(1),
  GITHUB_WEBHOOK_SECRET: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),

  // AI Providers
  ANTHROPIC_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),

  // Database
  MONGODB_URI: z.string().url().default('mongodb://localhost:27017/ai-code-reviewer'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Default AI Provider
  DEFAULT_AI_PROVIDER: z.enum(['claude', 'openai']).default('claude'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = z.prettifyError(result.error);
    throw new Error(`Environment validation failed:\n${formatted}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

export function clearEnvCache(): void {
  cachedEnv = null;
}
