import { verifyWebhookSignature } from './webhook/validator';
import { handleWebhook } from './webhook/handler';
import { getEnv } from './config/env';
import logger from './utils/logger';

interface APIGatewayEvent {
  headers: Record<string, string | undefined>;
  body: string | null;
  isBase64Encoded?: boolean;
}

interface APIGatewayResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export async function handler(event: APIGatewayEvent): Promise<APIGatewayResponse> {
  const responseHeaders = {
    'Content-Type': 'application/json',
    'X-Powered-By': 'ai-code-reviewer',
  };

  try {
    const env = getEnv();

    // Decode body
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf-8')
      : event.body || '';

    // Verify webhook signature
    const signature = event.headers['x-hub-signature-256'] || event.headers['X-Hub-Signature-256'];
    if (!verifyWebhookSignature(rawBody, signature, env.GITHUB_WEBHOOK_SECRET)) {
      logger.warn('Invalid webhook signature');
      return {
        statusCode: 401,
        headers: responseHeaders,
        body: JSON.stringify({ error: 'Invalid signature' }),
      };
    }

    // Parse payload
    const payload = JSON.parse(rawBody);
    const githubEvent = event.headers['x-github-event'] || event.headers['X-GitHub-Event'] || '';

    // Handle webhook
    const result = await handleWebhook(githubEvent, payload);

    return {
      statusCode: result.status,
      headers: responseHeaders,
      body: JSON.stringify({ message: result.message }),
    };
  } catch (error) {
    logger.error('Lambda handler error', { error });
    return {
      statusCode: 500,
      headers: responseHeaders,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}

// Local development server
if (process.env.NODE_ENV === 'development') {
  import('express').then((express) => {
    const app = express.default();
    app.use(express.default.json({ limit: '10mb' }));

    app.post('/webhook', async (req, res) => {
      const result = await handler({
        headers: req.headers as Record<string, string>,
        body: JSON.stringify(req.body),
      });
      res.status(result.statusCode).json(JSON.parse(result.body));
    });

    app.get('/health', (_req, res) => {
      res.json({ status: 'ok', service: 'ai-code-reviewer' });
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logger.info(`AI Code Reviewer running on port ${port}`);
    });
  });
}
