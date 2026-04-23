import express from 'express';
import { getReviewsByRepo, getAverageScore } from '../db/repositories/review.repo';
import { getSettings, upsertSettings, getSettingsByInstallation } from '../db/repositories/settings.repo';
import logger from '../utils/logger';

const router = express.Router();

// Get repos for an installation
router.get('/repos', async (req, res) => {
  try {
    const installationId = parseInt(req.query.installation_id as string, 10);
    if (!installationId) {
      res.status(400).json({ error: 'installation_id is required' });
      return;
    }
    const settings = await getSettingsByInstallation(installationId);
    res.json({ repos: settings });
  } catch (error) {
    logger.error('Failed to fetch repos', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get review history for a repo
router.get('/repos/:repo/reviews', async (req, res) => {
  try {
    const repo = decodeURIComponent(req.params.repo);
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    const [reviews, avgScore] = await Promise.all([
      getReviewsByRepo(repo, limit, offset),
      getAverageScore(repo),
    ]);

    res.json({ reviews, averageScore: Math.round(avgScore * 10) / 10 });
  } catch (error) {
    logger.error('Failed to fetch reviews', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get settings for a repo
router.get('/repos/:repo/settings', async (req, res) => {
  try {
    const repo = decodeURIComponent(req.params.repo);
    const settings = await getSettings(repo);
    if (!settings) {
      res.status(404).json({ error: 'Settings not found' });
      return;
    }
    res.json({ settings });
  } catch (error) {
    logger.error('Failed to fetch settings', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update settings for a repo
router.put('/repos/:repo/settings', async (req, res) => {
  try {
    const repo = decodeURIComponent(req.params.repo);
    const settings = await upsertSettings(repo, req.body);
    res.json({ settings });
  } catch (error) {
    logger.error('Failed to update settings', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GitHub OAuth callback placeholder
router.get('/auth/github', (_req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user,repo`;
  res.redirect(url);
});

router.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      res.status(400).json({ error: 'Missing code parameter' });
      return;
    }

    // Exchange code for token
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = (await response.json()) as { access_token: string };
    // In production, store the token securely and create a session
    res.json({ access_token: data.access_token });
  } catch (error) {
    logger.error('OAuth callback failed', { error });
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;
