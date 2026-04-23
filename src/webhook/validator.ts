import crypto from 'crypto';

export function verifyWebhookSignature(
  payload: string,
  signature: string | undefined,
  secret: string,
): boolean {
  if (!signature) return false;

  const expectedSignature =
    'sha256=' +
    crypto.createHmac('sha256', secret).update(payload, 'utf-8').digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  } catch {
    return false;
  }
}
