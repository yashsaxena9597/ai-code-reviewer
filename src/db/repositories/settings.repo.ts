import { Settings, type ISettings } from '../models/settings.model';

export async function getSettings(repo: string): Promise<ISettings | null> {
  return Settings.findOne({ repo }).exec();
}

export async function upsertSettings(
  repo: string,
  data: Partial<ISettings>,
): Promise<ISettings> {
  return Settings.findOneAndUpdate(
    { repo },
    { $set: data },
    { upsert: true, new: true, runValidators: true },
  ).exec() as Promise<ISettings>;
}

export async function getSettingsByInstallation(
  installationId: number,
): Promise<ISettings[]> {
  return Settings.find({ installationId }).exec();
}
