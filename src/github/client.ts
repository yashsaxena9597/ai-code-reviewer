import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import logger from '../utils/logger';

export function createAppOctokit(appId: string, privateKey: string): Octokit {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
    },
  });
}

export async function createInstallationOctokit(
  appId: string,
  privateKey: string,
  installationId: number,
): Promise<Octokit> {
  const appOctokit = createAppOctokit(appId, privateKey);

  const { data: installation } =
    await appOctokit.apps.createInstallationAccessToken({
      installation_id: installationId,
    });

  logger.info(`Created installation token for installation ${installationId}`);

  return new Octokit({
    auth: installation.token,
  });
}
